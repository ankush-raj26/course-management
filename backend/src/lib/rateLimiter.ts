import type { Request, Response, NextFunction } from 'express';

// super simple rate limiter, no library, just count requests per ip in a time window
// good enough for one server. if we ever run multiple servers this needs to move to redis
// so all servers share the same counts
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // per ip, per route, inside that window

type Bucket = {
  count: number;
  windowStart: number;
};

const buckets = new Map<string, Bucket>();

export const rateLimiter = function (req: Request, res: Response, next: NextFunction): void {
  // key by ip + route so signup and signin dont share the same counter
  const key = `${req.ip}:${req.originalUrl}`;
  const now = Date.now();

  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    // first request from this ip on this route, or the old window is over, start a fresh one
    buckets.set(key, { count: 1, windowStart: now });
    next();
    return;
  }

  if (bucket.count >= MAX_REQUESTS) {
    res.status(429).json({ message: 'too many requests, slow down and try again in a minute' });
    return;
  }

  bucket.count++;
  next();
};
