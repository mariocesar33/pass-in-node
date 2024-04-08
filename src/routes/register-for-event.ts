import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function registerForEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/events/:eventId/attendees',
    {
      schema: {
        body: z.object({
          name: z.string().min(4),
          email: z.string().email(),
        }),
        params: z.object({
          eventId: z.string().uuid(),
        }),
        response: {
          201: z.object({
            attendeeId: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params
      const { name, email } = request.body

      const attendeeFromEmail = await prisma.attendee.findUnique({
        where: {
          eventId_email: {
            email,
            eventId,
          },
        },
      })

      if (attendeeFromEmail) {
        throw new Error('this e-mail is already register for this event.')
      }

      const [event, amountOfAttendeesForEvent] = await Promise.all([
        // numero total de participantes no evento
        prisma.event.findUnique({
          where: {
            id: eventId,
          },
        }),

        // Se event tiver um numero maximo de participantes,
        // e numero total de participantes no evento for maior ao igual ao maximo numeros de participantes
        prisma.attendee.count({
          where: {
            eventId,
          },
        }),
      ])

      if (
        event?.maximumAttendees &&
        amountOfAttendeesForEvent >= event?.maximumAttendees
      ) {
        throw new Error(
          'The maximum number of attendees for this event has been reached.',
        )
      }

      const attendee = await prisma.attendee.create({
        data: {
          eventId,
          email,
          name,
        },
      })

      return reply.status(201).send({ attendeeId: attendee.id })
    },
  )
}
