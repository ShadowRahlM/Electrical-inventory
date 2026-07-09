import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";

export interface Employee {
  id: string;
  user: string | null;
  name: string;
  role: string;
  phone: string;
  email: string;
  salary: string;
  hire_date: string;
  attendance_today: Attendance | null;
  is_active: boolean;
  created_at: string;
}

export interface Attendance {
  id: string;
  employee: string;
  employee_name: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  is_present: boolean;
  notes: string;
}

export function useEmployees(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: async () => {
      const res = await apiClient.get("/employees/", { params });
      return res.data;
    },
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: async () => {
      const res = await apiClient.get(`/employees/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/employees/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.patch(`/employees/${id}/`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/employees/${id}/`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useAttendanceRecords(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: async () => {
      const res = await apiClient.get("/employees/attendance/", { params });
      return res.data;
    },
  });
}

export function useClockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { employee_id: string }) => {
      const res = await apiClient.post("/employees/attendance/clock_in/", data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useClockOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { employee_id: string }) => {
      const res = await apiClient.post("/employees/attendance/clock_out/", data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
