import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import type { JobStatus } from '@moore-tires/shared';

let io: Server | null = null;

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: (process.env['CORS_ORIGINS'] ?? '').split(',').map((o) => o.trim()),
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // Manager joins the dispatch room for today's board
    socket.on('join:dispatch', () => {
      void socket.join('dispatch:today');
    });

    socket.on('disconnect', () => {
      // Cleanup is automatic
    });
  });

  return io;
}

export function emitNewServiceRequest(serviceRequestId: string): void {
  io?.emit('sr:new', { serviceRequestId });
}

export function emitJobStatusChanged(jobId: string, status: JobStatus, technicianId: string): void {
  io?.to('dispatch:today').emit('job:status_changed', { jobId, status, technicianId });
}

export function emitCalendarUpdated(date: string): void {
  io?.to('dispatch:today').emit('calendar:updated', { date });
}
