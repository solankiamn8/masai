// index.ts (demo usage)
import { TaskService } from "./TaskService";
import { EmailService } from "./EmailService";

const taskService = new TaskService();
const emailService = new EmailService();

taskService.createTask("Complete Masai Assignment");
emailService.sendEmail("mentor@masai.school");
  