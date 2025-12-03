package com.springboot.MyTodoList.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SprintHoursDTO {
    private Long sprintId;
    private String sprintName;
    private Double totalHours;
}
