package com.saas.cours.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saas.cours.domain.User;
import com.saas.cours.repository.UserRepository;
import com.saas.cours.security.UserPrincipal;
import com.saas.cours.support.TestUsers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class InstructorCatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private User instructor;
    private User student;

    @BeforeEach
    void setUp() {
        instructor = userRepository.save(TestUsers.instructor("controller-instructor-catalog@test.com"));
        student = userRepository.save(TestUsers.student("controller-student-catalog@test.com"));
    }

    @Test
    void instructorCanCreateDraftCourse() throws Exception {
        authenticate(instructor);

        mockMvc.perform(post("/api/me/instructor/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Nouveau cours",
                                  "description": "Description",
                                  "level": "Débutant"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.published").value(false))
                .andExpect(jsonPath("$.title").value("Nouveau cours"));
    }

    @Test
    void createCourseWithInvalidLevelReturnsBadRequest() throws Exception {
        authenticate(instructor);

        mockMvc.perform(post("/api/me/instructor/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Nouveau cours",
                                  "level": "Expert"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addLessonWithInvalidYouTubeUrlReturnsFieldErrors() throws Exception {
        authenticate(instructor);

        String createResponse = mockMvc.perform(post("/api/me/instructor/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Cours vidéo",
                                  "level": "Débutant"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        long courseId = objectMapper.readTree(createResponse).get("id").asLong();

        mockMvc.perform(post("/api/me/instructor/courses/{courseId}/lessons", courseId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Leçon",
                                  "lessonType": "VIDEO",
                                  "contentUrl": "https://example.com/not-youtube"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.contentUrl").exists());
    }

    @Test
    void studentCannotListInstructorCoursesAtServiceLevel() throws Exception {
        authenticate(student);

        mockMvc.perform(get("/api/me/instructor/courses"))
                .andExpect(status().isForbidden());
    }

    @Test
    void instructorCanUpdateCourseTitle() throws Exception {
        authenticate(instructor);

        String createResponse = mockMvc.perform(post("/api/me/instructor/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Ancien titre",
                                  "level": "Débutant"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        long courseId = objectMapper.readTree(createResponse).get("id").asLong();

        mockMvc.perform(patch("/api/me/instructor/courses/{courseId}", courseId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Nouveau titre"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Nouveau titre"));
    }

    private void authenticate(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }
}
