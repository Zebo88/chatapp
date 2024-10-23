import { Request, Response, NextFunction } from "express";
import prisma from "../db/prisma";

export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message }= req.body;
    const { id:receiverId } = req.params;
    const senderId = req.user.id;

    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, receiverId],
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: {
            set: [senderId, receiverId]
          }
        }
      });
    }// Check to see if there is a conversation already created between the two users. If not, create a new conversation.

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        body: message,
        conversationId: conversation.id
      }
    });// Create a new message and associate it with the conversation.

    if (newMessage) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          messages: {
            connect: {
              id: newMessage.id
            }
          }
        }
      });
    } // Connect the new message to the conversation

    // Socket will be implemented here to send the message to the receiver

    res.status(201).json({ newMessage }); // Respond with the new message

  } catch (error: any) {
    console.log("Error in sendMessage controller.", error.message);
    res.status(500).json({ error: "Internal server error" });
    
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user.id;

    const conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, userToChatId],
        }
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          } // Order messages by creation date
        }
      }
    }); // Find the conversation between the sender and the user they want to chat with

    if (!conversation) {
      res.status(404).json([]); // If no conversation found, respond with an empty array
      return;
    }

    res.status(200).json(conversation.messages); // Respond with the messages in the conversation

  } catch (error: any) {
    console.log("Error in getMessages controller.", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}; 

export const getUsersForSidebar = async (req: Request, res: Response) => {
  try {
    const authUserId = req.user.id;

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: authUserId // Exclude the authenticated user
        }
      },
      select: {
        id: true,
        fullname: true,
        profilePic: true
      }
    }); // Find all users except the authenticated user

    res.status(200).json(users); // Respond with the list of users

  } catch (error: any) {
    console.log("Error in GetUsersForSidebar controller.", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};