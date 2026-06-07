import swaggerJSDoc from "swagger-jsdoc";

const errorResponse = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
};

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WC2026 Predictor API",
      version: "1.0.0",
      description: "Backend API for World Cup 2026 Predictor",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    tags: [
      { name: "Auth" },
      { name: "Tournaments" },
      { name: "Matches" },
      { name: "Predictions" },
      { name: "Leaderboard" },
      { name: "API-Football Admin" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: errorResponse,
        UserDto: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            username: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
            isEmailVerified: { type: "boolean" },
            emailVerifiedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/UserDto" },
            token: { type: "string" },
          },
        },
        TournamentDto: {
          type: "object",
          properties: {
            id: { type: "string" },
            slug: { type: "string" },
            name: { type: "string" },
            startsAt: { type: "string", format: "date-time" },
            endsAt: { type: "string", format: "date-time", nullable: true },
            prizePoolEntryDeadline: {
              type: "string",
              format: "date-time",
            },
            entryFee: { type: "string" },
            currency: { type: "string" },
            isPrizePoolEnabled: { type: "boolean" },
          },
        },
        TournamentParticipantDto: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            tournamentId: { type: "string" },
            participationType: { type: "string", enum: ["FREE", "PAID"] },
            paymentStatus: {
              type: "string",
              enum: ["UNPAID", "PENDING", "PAID", "FAILED", "EXPIRED"],
            },
            paidAt: { type: "string", format: "date-time", nullable: true },
            prizeEligible: { type: "boolean" },
            joinedAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        PrizePoolPaymentDto: {
          type: "object",
          properties: {
            username: { type: "string" },
            email: { type: "string", format: "email" },
            amount: { type: "number", example: 100 },
            paidAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        PrizePoolDto: {
          type: "object",
          properties: {
            tournamentId: { type: "string" },
            totalAmount: { type: "number", example: 300 },
            paidUsersCount: { type: "integer", example: 3 },
            payments: {
              type: "array",
              items: { $ref: "#/components/schemas/PrizePoolPaymentDto" },
            },
          },
        },
        TeamDto: {
          type: "object",
          properties: {
            id: { type: "string" },
            externalId: { type: "integer", nullable: true },
            name: { type: "string" },
            code: { type: "string", nullable: true },
            logoUrl: { type: "string", nullable: true },
          },
        },
        MatchDto: {
          type: "object",
          properties: {
            id: { type: "string" },
            externalFixtureId: { type: "integer", nullable: true },
            stage: {
              type: "string",
              enum: [
                "GROUP",
                "ROUND_OF_32",
                "ROUND_OF_16",
                "QUARTER_FINAL",
                "SEMI_FINAL",
                "THIRD_PLACE",
                "FINAL",
              ],
            },
            groupName: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["SCHEDULED", "LIVE", "FINISHED", "POSTPONED", "CANCELLED"],
            },
            startsAt: { type: "string", format: "date-time" },
            elapsed: { type: "integer", nullable: true },
            homeTeam: {
              allOf: [{ $ref: "#/components/schemas/TeamDto" }],
              nullable: true,
            },
            awayTeam: {
              allOf: [{ $ref: "#/components/schemas/TeamDto" }],
              nullable: true,
            },
            homeScore: { type: "integer", nullable: true },
            awayScore: { type: "integer", nullable: true },
            homeExtraTimeScore: { type: "integer", nullable: true },
            awayExtraTimeScore: { type: "integer", nullable: true },
            homePenaltyScore: { type: "integer", nullable: true },
            awayPenaltyScore: { type: "integer", nullable: true },
            venueName: { type: "string", nullable: true },
            city: { type: "string", nullable: true },
          },
        },
        PredictionDto: {
          type: "object",
          properties: {
            id: { type: "string" },
            matchId: { type: "string" },
            userId: { type: "string" },
            tournamentId: { type: "string" },
            homeScore: { type: "integer" },
            awayScore: { type: "integer" },
            points: { type: "number", nullable: true },
            calculatedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        LeaderboardEntryDto: {
          type: "object",
          properties: {
            position: { type: "integer" },
            userId: { type: "string" },
            username: { type: "string" },
            totalPoints: { type: "number" },
            predictionsCount: { type: "integer" },
            calculatedPredictionsCount: { type: "integer" },
            participationType: { type: "string", nullable: true },
          },
        },
        GroupStandingDto: {
          type: "object",
          properties: {
            position: { type: "integer" },
            team: { $ref: "#/components/schemas/TeamDto" },
            played: { type: "integer" },
            wins: { type: "integer" },
            draws: { type: "integer" },
            losses: { type: "integer" },
            goalsFor: { type: "integer" },
            goalsAgainst: { type: "integer" },
            goalDifference: { type: "integer" },
            points: { type: "integer" },
            isQualified: { type: "boolean" },
            qualificationStatus: {
              type: "string",
              enum: [
                "QUALIFIED_DIRECT",
                "QUALIFIED_THIRD_PLACE",
                "PENDING_THIRD_PLACE",
                "ELIMINATED",
              ],
            },
          },
        },
        ThirdPlaceStandingDto: {
          allOf: [
            { $ref: "#/components/schemas/GroupStandingDto" },
            {
              type: "object",
              properties: {
                sourceGroupName: { type: "string" },
              },
            },
          ],
        },
        StandingsResponse: {
          type: "object",
          properties: {
            tournamentId: { type: "string" },
            groups: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  groupName: { type: "string" },
                  teams: {
                    type: "array",
                    items: { $ref: "#/components/schemas/GroupStandingDto" },
                  },
                },
              },
            },
            thirdPlaceRanking: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ThirdPlaceStandingDto",
              },
            },
          },
        },
      },
    },
    paths: {
      "/api/v1/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register user",
          description: "Creates a user and email verification token. Sends a verification email when SMTP is configured.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "email",
                    "username",
                    "password",
                    "firstName",
                    "lastName",
                  ],
                  properties: {
                    email: { type: "string", format: "email" },
                    username: { type: "string" },
                    password: { type: "string", format: "password" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Registered" },
            400: { description: "Invalid request" },
          },
        },
      },
      "/api/v1/auth/verify-email": {
        get: {
          tags: ["Auth"],
          summary: "Verify email",
          parameters: [
            {
              name: "token",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Email verified successfully" },
            400: { description: "Invalid, expired, used, or missing token" },
          },
        },
      },
      "/api/v1/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", format: "password" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            400: { description: "Invalid request" },
            403: { description: "Email not verified" },
          },
        },
      },
      "/api/v1/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Current user",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserDto" },
                },
              },
            },
            401: { description: "Unauthorized" },
            404: { description: "User not found" },
          },
        },
      },
      "/api/v1/tournaments": {
        get: {
          tags: ["Tournaments"],
          summary: "List tournaments",
          responses: {
            200: {
              description: "Tournament list",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/TournamentDto" },
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/tournaments/{slug}": {
        get: {
          tags: ["Tournaments"],
          summary: "Get tournament by slug",
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Tournament" },
            404: { description: "Tournament not found" },
          },
        },
      },
      "/api/v1/tournaments/{slug}/join": {
        post: {
          tags: ["Tournaments"],
          summary: "Join tournament",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["participationType"],
                  properties: {
                    participationType: {
                      type: "string",
                      enum: ["FREE", "PAID"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Joined tournament" },
            400: { description: "Invalid request" },
            401: { description: "Unauthorized" },
            404: { description: "Tournament not found" },
            409: { description: "Already joined" },
          },
        },
      },
      "/api/v1/tournaments/{slug}/participation": {
        get: {
          tags: ["Tournaments"],
          summary: "Get current user's tournament participation",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Participation status" },
            401: { description: "Unauthorized" },
            404: { description: "Tournament not found" },
          },
        },
      },
      "/api/v1/tournaments/{slug}/participant/payment": {
        patch: {
          tags: ["Tournaments"],
          summary: "ADMIN only: update participant payment status",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: {
                    email: { type: "string", format: "email" },
                    paymentStatus: {
                      type: "string",
                      enum: ["UNPAID", "PENDING", "PAID", "FAILED", "EXPIRED"],
                      description: "Use paymentStatus or status. amount is required when the value is PAID. Only PAID participants can be confirmed as PAID.",
                    },
                    status: {
                      type: "string",
                      enum: ["UNPAID", "PENDING", "PAID", "FAILED", "EXPIRED"],
                      description: "Backward-compatible alias for paymentStatus.",
                    },
                    amount: {
                      type: "number",
                      minimum: 100,
                      example: 100,
                      description: "Required when confirming PAID status. Must be at least 100.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Payment updated",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/TournamentParticipantDto",
                  },
                },
              },
            },
            400: { description: "Invalid request, FREE participant payment confirmation, or amount below 100" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Not found" },
            409: { description: "Payment is already confirmed" },
          },
        },
      },
      "/api/v1/tournaments/{slug}/prize-pool": {
        get: {
          tags: ["Tournaments"],
          summary: "Get tournament prize pool payments",
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Tournament prize pool",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PrizePoolDto" },
                },
              },
            },
            404: { description: "Tournament not found" },
          },
        },
      },
      "/api/v1/tournaments/{id}/standings": {
        get: {
          tags: ["Tournaments"],
          summary: "Get tournament group standings",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Standings",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/StandingsResponse" },
                },
              },
            },
            404: { description: "Tournament not found" },
          },
        },
      },
      "/api/v1/matches": {
        get: {
          tags: ["Matches"],
          summary: "List matches",
          parameters: [
            {
              name: "tournamentId",
              in: "query",
              required: false,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Match list" },
          },
        },
      },
      "/api/v1/matches/{id}": {
        get: {
          tags: ["Matches"],
          summary: "Get match details",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Match details",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MatchDto" },
                },
              },
            },
            404: { description: "Match not found" },
          },
        },
      },
      "/api/v1/matches/{id}/predictions": {
        get: {
          tags: ["Matches"],
          summary: "Get match predictions visibility for current user",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Predictions visibility response" },
            401: { description: "Unauthorized" },
            404: { description: "Match not found" },
          },
        },
      },
      "/api/v1/matches/{id}/result": {
        patch: {
          tags: ["Matches"],
          summary: "ADMIN only: update match result",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["homeScore", "awayScore"],
                  properties: {
                    homeScore: { type: "integer" },
                    awayScore: { type: "integer" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Result updated" },
            400: { description: "Invalid score" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Match not found" },
          },
        },
      },
      "/api/v1/matches/{id}/calculate": {
        post: {
          tags: ["Matches"],
          summary: "ADMIN only: manually calculate prediction points for a match",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Prediction points calculated" },
            400: { description: "Match result is not ready" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Match not found" },
          },
        },
      },
      "/api/v1/predictions/my": {
        get: {
          tags: ["Predictions"],
          summary: "Get current user's predictions",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Prediction list" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/v1/predictions/my/stats": {
        get: {
          tags: ["Predictions"],
          summary: "Get current user's prediction stats",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Prediction stats" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/v1/predictions": {
        post: {
          tags: ["Predictions"],
          summary: "Create prediction",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["matchId", "homeScore", "awayScore"],
                  properties: {
                    matchId: { type: "string" },
                    homeScore: { type: "integer" },
                    awayScore: { type: "integer" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Prediction created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PredictionDto" },
                },
              },
            },
            400: { description: "Invalid request" },
            401: { description: "Unauthorized" },
            403: { description: "Must join tournament first" },
            404: { description: "Match not found" },
            409: { description: "Duplicate prediction" },
          },
        },
      },
      "/api/v1/leaderboard": {
        get: {
          tags: ["Leaderboard"],
          summary: "Get overall leaderboard",
          responses: {
            200: {
              description: "Leaderboard",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/LeaderboardEntryDto",
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/leaderboard/prize": {
        get: {
          tags: ["Leaderboard"],
          summary: "Get paid prize leaderboard",
          responses: {
            200: { description: "Prize leaderboard" },
          },
        },
      },
      "/api/v1/admin": {
        get: {
          tags: ["API-Football Admin"],
          summary: "ADMIN only: admin module placeholder",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Admin module placeholder" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/v1/api-football/sync/teams": {
        post: {
          tags: ["API-Football Admin"],
          summary: "ADMIN only: sync World Cup teams",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["season"],
                  properties: { season: { type: "integer", example: 2026 } },
                },
              },
            },
          },
          responses: {
            200: { description: "Sync summary" },
            400: { description: "Season is required" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/v1/api-football/sync/fixtures": {
        post: {
          tags: ["API-Football Admin"],
          summary: "ADMIN only: sync World Cup fixtures",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["season"],
                  properties: { season: { type: "integer", example: 2026 } },
                },
              },
            },
          },
          responses: {
            200: { description: "Sync summary" },
            400: { description: "Season is required" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/v1/api-football/sync/fixtures/{fixtureId}/result": {
        post: {
          tags: ["API-Football Admin"],
          summary: "ADMIN only: sync fixture result",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "fixtureId",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            200: { description: "Fixture result sync summary" },
            400: { description: "Fixture id is required" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Match not found" },
          },
        },
      },
      "/api/v1/api-football/sync/fixture-result/{fixtureId}": {
        post: {
          tags: ["API-Football Admin"],
          summary: "ADMIN only: sync fixture result alternate route",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "fixtureId",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            200: { description: "Fixture result sync summary" },
            400: { description: "Fixture id is required" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Match not found" },
          },
        },
      },
      "/api/v1/api-football/sync/team-groups": {
        post: {
          tags: ["API-Football Admin"],
          summary: "ADMIN only: sync team group names",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Team groups sync summary" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
    },
  },
  apis: [],
});
