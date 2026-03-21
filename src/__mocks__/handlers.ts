/**
 * MSW Handlers for Test Mocking
 * Author: Ahmed Adel Bakr Alderai
 */

import { http, HttpResponse } from "msw";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const handlers = [
  // Health check
  http.get(`${API_URL}/api/health`, () => {
    return HttpResponse.json({ status: "ok" });
  }),

  // Auth endpoints
  http.post(`${API_URL}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    if (body.email === "test@example.com" && body.password === "password") {
      return HttpResponse.json({
        success: true,
        user: {
          id: "user_1",
          email: "test@example.com",
          name: "Test User",
        },
        token: "mock_token_123",
      });
    }
    return HttpResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  }),

  http.post(`${API_URL}/api/auth/signup`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      user: {
        id: "user_2",
        email: body.email,
        name: body.name || "New User",
      },
      token: "mock_token_new",
    });
  }),

  http.post(`${API_URL}/api/auth/logout`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_URL}/api/auth/me`, () => {
    return HttpResponse.json({
      id: "user_1",
      email: "test@example.com",
      name: "Test User",
    });
  }),

  // Jobs endpoints
  http.get(`${API_URL}/api/jobs`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          title: "Software Engineer",
          company: "Tech Corp",
          location: "San Francisco, CA",
          salary_min: 120000,
          salary_max: 180000,
          job_url: "https://example.com/jobs/1",
          posted_at: "2024-03-01T00:00:00Z",
        },
      ],
    });
  }),

  http.post(`${API_URL}/api/jobs/search`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          title: body.title || "Software Engineer",
          company: "Tech Corp",
          location: body.location || "Remote",
        },
      ],
    });
  }),

  // Applications endpoints
  http.get(`${API_URL}/api/applications`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          job_id: 1,
          status: "applied",
          applied_at: "2024-03-01T00:00:00Z",
        },
      ],
    });
  }),

  http.post(`${API_URL}/api/applications`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        id: 2,
        job_id: body.job_id,
        status: "applied",
        applied_at: new Date().toISOString(),
      },
    });
  }),

  // Analytics endpoints
  http.get(`${API_URL}/api/analytics/dashboard`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        total_jobs: 150,
        total_applications: 45,
        success_rate: 30,
        avg_response_time: "3 days",
      },
    });
  }),

  // Intelligence endpoints
  http.get(`${API_URL}/api/intelligence/ghost-detection`, () => {
    return HttpResponse.json({
      is_ghost_job: false,
      confidence: 0.95,
      reason: "Job posting appears legitimate",
    });
  }),

  http.post(`${API_URL}/api/intelligence/detect-employment-type`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      employment_type: "full-time",
      confidence: 0.92,
      reasoning: body.description ? "Based on job description" : "Default response",
    });
  }),

  http.get(`${API_URL}/api/intelligence/visa-sponsorship`, () => {
    return HttpResponse.json({
      sponsors_visa: true,
      confidence: 0.88,
    });
  }),

  http.get(`${API_URL}/api/intelligence/remote-type`, () => {
    return HttpResponse.json({
      remote_type: "remote",
      confidence: 0.85,
    });
  }),

  http.get(`${API_URL}/api/salary/benchmark`, ({ request }) => {
    const url = new URL(request.url);
    const title = url.searchParams.get("title") || "Software Engineer";
    const location = url.searchParams.get("location") || "San Francisco";

    return HttpResponse.json({
      min_salary: 95000,
      max_salary: 150000,
      median_salary: 120000,
      currency: "USD",
      title: title,
      location: location,
    });
  }),
];
