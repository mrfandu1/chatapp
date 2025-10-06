package com.team.chatapp.dto.response;

import lombok.Builder;

@Builder
public record ApiResponseDTO(String message, boolean status) {
}
