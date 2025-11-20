package com.springboot.MyTodoList.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class LLMClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PYTHON_SERVICE_URL = "http://host.docker.internal:9000/analyze-task";

    public TaskAnalysisResponse analyzeTask(String title, String description, Integer estimatedHours,
            Integer priority) {
        TaskAnalysisRequest request = new TaskAnalysisRequest();
        request.setTitle(title);
        request.setDescription(description != null ? description : "");
        request.setEstimatedHours(estimatedHours);
        request.setPriority(priority != null ? priority : 0);

        try {
            return restTemplate.postForObject(PYTHON_SERVICE_URL, request, TaskAnalysisResponse.class);
        } catch (Exception e) {
            // Return error message if Python service fails
            TaskAnalysisResponse errorResponse = new TaskAnalysisResponse();
            errorResponse.setAnalysis("Error al analizar la tarea: " + e.getMessage());
            return errorResponse;
        }
    }

    @Data
    public static class TaskAnalysisRequest {
        private String title;
        private String description;
        @JsonProperty("estimatedHours")
        private Integer estimatedHours;
        private Integer priority;
    }

    @Data
    public static class TaskAnalysisResponse {
        private String analysis;
    }
}