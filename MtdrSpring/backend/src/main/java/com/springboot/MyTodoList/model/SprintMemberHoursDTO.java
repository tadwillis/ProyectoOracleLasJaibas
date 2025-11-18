package com.springboot.MyTodoList.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SprintMemberHoursDTO {

    private Long userId;
    private String fullName;

    private Long sprintId;
    private String sprintName;

    private Double totalHours;
}
