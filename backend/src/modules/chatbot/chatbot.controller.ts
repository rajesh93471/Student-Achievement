import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ChatbotService } from "./chatbot.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@Controller("chatbot")
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  chat(@Req() req: any, @Body() body: any) {
    return this.chatbotService.chatWithBot(req.user, body);
  }
}
