import { google } from 'googleapis'

export class CalendarService {
  private calendar

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    this.calendar = google.calendar({ version: 'v3', auth })
  }

  async getAvailability(timeMin: string, timeMax: string) {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          items: [{ id: 'primary' }],
        },
      })
      return response.data.calendars?.primary?.busy || []
    } catch (error) {
      console.error('Error fetching availability:', error)
      throw error
    }
  }

  async createEvent(eventDetails: {
    summary: string
    description?: string
    start: { dateTime: string; timeZone: string }
    end: { dateTime: string; timeZone: string }
    attendees: { email: string }[]
  }) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: {
          ...eventDetails,
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
      })
      return response.data
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  async listEvents(timeMin: string, timeMax: string) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      })
      return response.data.items || []
    } catch (error) {
      console.error('Error listing events:', error)
      throw error
    }
  }

  async deleteEvent(eventId: string) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
      })
      return true
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  }
}