import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { SocketEvents } from '@moore-tires/shared';

type JobStatus = 'SCHEDULED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';

interface Job {
  id: string;
  status: JobStatus;
  technicianName: string;
  customerName: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  serviceType: string;
  startsAt: string;
  endsAt: string;
  isMobileService: boolean;
}

const STATUS_COLS: JobStatus[] = ['SCHEDULED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETE'];

const STATUS_LABELS: Record<JobStatus, string> = {
  SCHEDULED: 'Scheduled',
  EN_ROUTE: 'En Route',
  IN_PROGRESS: 'In Progress',
  COMPLETE: 'Complete',
  CANCELLED: 'Cancelled',
};

const STATUS_DOT: Record<JobStatus, string> = {
  SCHEDULED: 'bg-blue-400',
  EN_ROUTE: 'bg-amber-400',
  IN_PROGRESS: 'bg-violet-400',
  COMPLETE: 'bg-emerald-400',
  CANCELLED: 'bg-gray-500',
};

function JobCard({ job }: { job: Job }) {
  return (
    <div className="card cursor-grab select-none p-3 transition-shadow hover:shadow-lg hover:shadow-black/30">
      {/* Status pill */}
      <div className={`status-${job.status.toLowerCase()}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[job.status]}`} aria-hidden="true" />
        {STATUS_LABELS[job.status]}
      </div>

      {/* Vehicle */}
      <p className="mt-2 font-medium text-gray-100">
        {job.vehicleYear} {job.vehicleMake} {job.vehicleModel}
      </p>
      <p className="text-xs text-gray-500">{job.serviceType.replace(/_/g, ' ')}</p>

      {/* Customer */}
      <div className="mt-3 flex items-center gap-2 border-t border-surface-border pt-2">
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[10px] font-semibold text-gray-400">
          {job.customerName[0]}
        </div>
        <p className="truncate text-xs text-gray-400">{job.customerName}</p>
        {job.isMobileService && (
          <span className="ml-auto flex-shrink-0 rounded bg-brand-500/10 px-1 py-0.5 text-[10px] font-semibold text-brand-400">
            MOBILE
          </span>
        )}
      </div>

      {/* Technician + time */}
      <p className="mt-1 text-[10px] text-gray-600">
        {job.technicianName} · {new Date(job.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}

function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io('/', { path: '/socket.io', transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => { socket.disconnect(); };
  }, []);

  return { socket: socketRef.current, connected };
}

export function DashboardPage() {
  const { socket, connected } = useSocket();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [updatingId, setUpdatingId] = useState<string>();

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/v1/jobs/today');
        if (!res.ok) throw new Error(`${res.status}`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { data } = await res.json();
        setJobs(data as Job[]);
      } catch {
        setError('Failed to load jobs.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Wire socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleStatusChange = (payload: { jobId: string; status: JobStatus }) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === payload.jobId ? { ...j, status: payload.status } : j))
      );
    };

    const handleDispatchRefresh = (payload: Job[]) => {
      setJobs(payload);
    };

    socket.on('job:status_changed' as keyof SocketEvents, handleStatusChange as never);
    socket.on('dispatch:today' as keyof SocketEvents, handleDispatchRefresh as never);

    return () => {
      socket.off('job:status_changed' as keyof SocketEvents, handleStatusChange as never);
      socket.off('dispatch:today' as keyof SocketEvents, handleDispatchRefresh as never);
    };
  }, [socket]);

  const updateStatus = async (jobId: string, newStatus: JobStatus) => {
    setUpdatingId(jobId);
    try {
      const res = await fetch(`/api/v1/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
    } catch {
      // TODO: toast error
    } finally {
      setUpdatingId(undefined);
    }
  };

  const colJobs = (status: JobStatus) => jobs.filter((j) => j.status === status);

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <header className="flex items-center justify-between border-b border-surface-border bg-[#0D0F14] px-6 py-4">
        <div>
          <h1 className="font-display font-bold text-xl uppercase tracking-wider text-gray-100">
            Dispatch Board
          </h1>
          <p className="text-xs text-gray-500">
            {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs ${connected ? 'text-emerald-400' : 'text-gray-600'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} aria-hidden="true" />
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </header>

      {/* Board */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center text-gray-600 text-sm">Loading jobs…</div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center text-red-400 text-sm">{error}</div>
      ) : (
        <div className="flex flex-1 gap-px bg-surface-border overflow-x-auto p-4">
          {STATUS_COLS.map((status) => (
            <div key={status} className="flex w-64 flex-shrink-0 flex-col gap-2 bg-surface-base p-2">
              {/* Column header */}
              <div className="flex items-center gap-2 px-1 py-2">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {STATUS_LABELS[status]}
                </span>
                <span className="ml-auto rounded bg-surface-elevated px-1.5 py-0.5 text-xs text-gray-600">
                  {colJobs(status).length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 overflow-y-auto">
                {colJobs(status).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
                {colJobs(status).length === 0 && (
                  <p className="px-2 py-4 text-center text-xs text-gray-700">—</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
