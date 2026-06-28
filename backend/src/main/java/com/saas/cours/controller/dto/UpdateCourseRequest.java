package com.saas.cours.controller.dto;



import com.saas.cours.domain.enums.CourseLevel;

import jakarta.validation.constraints.Size;



public record UpdateCourseRequest(

        @Size(max = 255) String title,

        @Size(max = 5000) String description,

        CourseLevel level,

        Boolean published

) {

}

