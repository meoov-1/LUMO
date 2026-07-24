package com.lumo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lumo.dto.CareerPredictionResponse;
import com.lumo.entity.CareerPrediction;
import com.lumo.entity.JournalEntry;
import com.lumo.repository.CareerPredictionRepository;
import com.lumo.repository.JournalEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CareerService {

    private final CareerPredictionRepository careerPredictionRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Transactional
    public CareerPredictionResponse generateCareerPrediction(Long userId, Integer cycle) {
        log.info("Generating career prediction for user {} cycle {}", userId, cycle);

        // Fetch all 30 journal entries for the completed cycle
        List<JournalEntry> entries = journalEntryRepository.findByUserIdAndCycleOrderByLevelAsc(userId, cycle);

        if (entries.size() < 30) {
            throw new IllegalStateException("Cannot generate prediction: cycle not completed (only " + entries.size() + " entries)");
        }

        // Concatenate all reflections
        String concatenatedReflections = entries.stream()
                .map(entry -> "Day " + entry.getLevel() + " (Mood: " + entry.getMoodTag() + "):\n" + entry.getContent())
                .collect(Collectors.joining("\n\n---\n\n"));

        // Create Gemini API prompt
        String prompt = buildCareerAnalysisPrompt(concatenatedReflections);

        // Call Gemini API
        String aiResponse = callGeminiApi(prompt);

        // Parse AI response
        CareerAnalysis analysis = parseCareerAnalysis(aiResponse);

        // Save to database
        CareerPrediction prediction = CareerPrediction.builder()
                .userId(userId)
                .cycle(cycle)
                .topCareers(analysis.getTopCareers())
                .strengthsSummary(analysis.getStrengthsSummary())
                .growthRoadmap(analysis.getGrowthRoadmap())
                .fullAnalysis(aiResponse)
                .build();

        prediction = careerPredictionRepository.save(prediction);
        log.info("Career prediction saved: ID={}", prediction.getId());

        return mapToResponse(prediction);
    }

    public CareerPredictionResponse getLatestPrediction(String email) {
        // This method needs userId - we'll handle this in the controller
        throw new UnsupportedOperationException("Use getUserLatestPrediction with userId");
    }

    public CareerPredictionResponse getUserLatestPrediction(Long userId) {
        CareerPrediction prediction = careerPredictionRepository.findTopByUserIdOrderByGeneratedAtDesc(userId)
                .orElseThrow(() -> new RuntimeException("No career predictions found. Complete a 30-day cycle first."));

        return mapToResponse(prediction);
    }

    private String buildCareerAnalysisPrompt(String reflections) {
        return String.format("""
                Analyze these 30 daily reflections from the user. Extract key emotional patterns, 
                problem-solving habits, core passions, and personal strengths.
                
                Generate a structured 360° Career Path Prediction including:
                1. Top 3 Recommended Career Paths / Roles (be specific)
                2. Core Strengths & Values (based on patterns observed)
                3. 30-Day Growth Synthesis Summary
                4. Actionable Next Steps & Skill Growth Roadmap
                
                Format your response as JSON with the following structure:
                {
                  "topCareers": ["Career 1", "Career 2", "Career 3"],
                  "strengthsSummary": "Detailed summary of strengths and values...",
                  "growthRoadmap": "Actionable next steps and skill development plan..."
                }
                
                User's 30-Day Reflections:
                %s
                """, reflections);
    }

    private String callGeminiApi(String prompt) {
        try {
            WebClient webClient = webClientBuilder
                    .baseUrl(geminiApiUrl)
                    .build();

            Map<String, Object> requestBody = new HashMap<>();
            
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            
            List<Map<String, String>> parts = new ArrayList<>();
            Map<String, String> part = new HashMap<>();
            part.put("text", prompt);
            parts.add(part);
            
            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);

            String response = webClient.post()
                    .uri(uriBuilder -> uriBuilder.queryParam("key", geminiApiKey).build())
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.debug("Gemini API raw response: {}", response);

            // Parse response to extract text
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode candidates = rootNode.path("candidates");
            
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content = firstCandidate.path("content");
                JsonNode parts = content.path("parts");
                
                if (parts.isArray() && parts.size() > 0) {
                    String text = parts.get(0).path("text").asText();
                    log.info("Successfully received Gemini API response");
                    return text;
                }
            }

            throw new RuntimeException("Invalid Gemini API response format");

        } catch (Exception e) {
            log.error("Failed to call Gemini API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate career prediction: " + e.getMessage(), e);
        }
    }

    private CareerAnalysis parseCareerAnalysis(String aiResponse) {
        try {
            // Try to extract JSON from the response (Gemini might wrap it in markdown)
            String jsonContent = aiResponse;
            if (aiResponse.contains("```json")) {
                int startIdx = aiResponse.indexOf("```json") + 7;
                int endIdx = aiResponse.lastIndexOf("```");
                jsonContent = aiResponse.substring(startIdx, endIdx).trim();
            } else if (aiResponse.contains("```")) {
                int startIdx = aiResponse.indexOf("```") + 3;
                int endIdx = aiResponse.lastIndexOf("```");
                jsonContent = aiResponse.substring(startIdx, endIdx).trim();
            }

            JsonNode rootNode = objectMapper.readTree(jsonContent);

            List<String> topCareers = new ArrayList<>();
            JsonNode careersNode = rootNode.path("topCareers");
            if (careersNode.isArray()) {
                careersNode.forEach(node -> topCareers.add(node.asText()));
            }

            String strengthsSummary = rootNode.path("strengthsSummary").asText();
            String growthRoadmap = rootNode.path("growthRoadmap").asText();

            return new CareerAnalysis(topCareers, strengthsSummary, growthRoadmap);

        } catch (Exception e) {
            log.warn("Failed to parse structured JSON, using fallback parsing: {}", e.getMessage());
            
            // Fallback: Extract information from unstructured text
            List<String> topCareers = List.of("Career Path Analysis Available", "See Full Analysis", "Personalized Recommendations");
            return new CareerAnalysis(topCareers, aiResponse.substring(0, Math.min(500, aiResponse.length())), aiResponse);
        }
    }

    private CareerPredictionResponse mapToResponse(CareerPrediction prediction) {
        return CareerPredictionResponse.builder()
                .id(prediction.getId())
                .cycle(prediction.getCycle())
                .topCareers(prediction.getTopCareers())
                .strengthsSummary(prediction.getStrengthsSummary())
                .growthRoadmap(prediction.getGrowthRoadmap())
                .fullAnalysis(prediction.getFullAnalysis())
                .generatedAt(prediction.getGeneratedAt())
                .build();
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    private static class CareerAnalysis {
        private List<String> topCareers;
        private String strengthsSummary;
        private String growthRoadmap;
    }
}
