import * as signalR from '@microsoft/signalr'

const HUB_URL = 'https://cinematestapi.runasp.net/tickets'

class TicketHubService {
  private connection: signalR.HubConnection | null = null
  private sessionId: string | null = null

  public onSeatLocked: ((seatId: string, userId: string) => void) | null = null
  public onSeatUnlocked: ((seatId: string) => void) | null = null

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()
  }

  public async startConnection(sessionId: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      if (this.sessionId !== sessionId) {
        await this.leaveSession(this.sessionId!)
        await this.joinSession(sessionId)
      }
      return
    }

    try {
      await this.connection?.start()

      await this.joinSession(sessionId)
      this.registerHandlers()
    } catch (err) {
      console.error('SignalR Connection Error: ', err)
    }
  }

  public async stopConnection() {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      if (this.sessionId) {
        await this.leaveSession(this.sessionId)
      }
      await this.connection?.stop()
      console.log('SignalR Disconnected')
    }
    this.sessionId = null
  }

  private async joinSession(sessionId: string) {
    this.sessionId = sessionId
    try {
      await this.connection?.invoke('JoinSessionGroup', sessionId)
    } catch (err) {
      console.error('Error joining session group:', err)
    }
  }

  private async leaveSession(sessionId: string) {
    try {
      await this.connection?.invoke('LeaveSessionGroup', sessionId)
    } catch (err) {
      console.error('Error leaving session group:', err)
    }
  }

  private registerHandlers() {
    if (!this.connection) return

    this.connection.off('ReceiveSeatStatusChange')
    this.connection.on(
      'ReceiveSeatStatusChange',
      (seatId: string, status: string, userId: string | null) => {
        console.log('ReceiveSeatStatusChange:', { seatId, status, userId })

        if (status === 'Locked' || status === 'Reserved') {
          this.onSeatLocked?.(seatId, userId || '')
        } else if (status === 'Available') {
          this.onSeatUnlocked?.(seatId)
        }
      },
    )
  }
}

export const ticketHub = new TicketHubService()
