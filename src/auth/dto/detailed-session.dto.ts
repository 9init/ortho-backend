import { Session } from "../entities/session.entity";
import { DetectResult } from "node-device-detector";

export class DetailedSession extends Session {
  device: DetectResult;
}
