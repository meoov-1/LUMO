package com.lumo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JournalSubmitRequest {

    @NotBlank(message = "Content is required")
    @Size(min = 10, max = 5000, message = "Content must be between 10 and 5000 characters")
    private String content;

    @Size(max = 50, message = "Mood tag must not exceed 50 characters")
    private String moodTag;

    @Min(value = 1, message = "Reflection score must be between 1 and 10")
    @Max(value = 10, message = "Reflection score must be between 1 and 10")
    private Integer reflectionScore;
}
