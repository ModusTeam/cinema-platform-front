import { getApiBaseUrl } from '@/shared/api/apiUrl'
import * as signalR from '@microsoft/signalr'

const HUB_URL = `${getApiBaseUrl().replace(/\/api$/, '')}/tickets`

class TicketHubService {
  private connection: signalR.HubConnection | null = null
  private sessionId: string | null = null
  private requestedSessionId: string | null = null
  private operations: Promise<void> = Promise.resolve()

  public onSeatLocked: ((seatId: string, userId: string) => void) | null = null
  public onSeatUnlocked: ((seatId: string) => void) | null = null
  public onReconnected: (() => void) | null = null

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()
    this.registerHandlers()
    this.connection.onreconnected(() => {
      this.operations = this.operations.then(async () => {
        const sessionId = this.requestedSessionId
        if (!sessionId) return
        try {
          await this.connection?.invoke('JoinSessionGroup', sessionId)
          this.sessionId = sessionId
          this.onReconnected?.()
        } catch (error) {
          console.error('Error rejoining session group:', error)
        }
      })
    })
  }

  public startConnection(sessionId: string): Promise<void> {
    this.operations = this.operations.then(async () => {
      this.requestedSessionId = sessionId
      try {
        if (this.connection?.state === signalR.HubConnectionState.Disconnected) {
          await this.connection?.start()
        }
        if (this.connection?.state !== signalR.HubConnectionState.Connected) return
        if (this.sessionId === sessionId) return
        if (this.sessionId) await this.leaveSession(this.sessionId)
        await this.connection?.invoke('JoinSessionGroup', sessionId)
        this.sessionId = sessionId
      } catch (error) {
        console.error('SignalR Connection Error:', error)
      }
    })
    return this.operations
  }

  public stopConnection(): Promise<void> {
    this.operations = this.operations.then(async () => {
      this.requestedSessionId = null
      if (this.connection?.state === signalR.HubConnectionState.Connected) {
        if (this.sessionId) await this.leaveSession(this.sessionId)
      }
      if (this.connection?.state !== signalR.HubConnectionState.Disconnected) {
        await this.connection?.stop()
      }
      this.sessionId = null
    }).catch(error => {
      this.requestedSessionId = null
      this.sessionId = null
      console.error('SignalR disconnection error:', error)
    })
    return this.operations
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

    this.connection.on(
      'SeatLocked',
      (sessionId: string, seatId: string, userId: string) => {
        if (this.sessionId === sessionId && this.onSeatLocked) {
          this.onSeatLocked(seatId, userId)
        }
      },
    )

    this.connection.on('SeatUnlocked', (sessionId: string, seatId: string) => {
      if (this.sessionId === sessionId && this.onSeatUnlocked) {
        this.onSeatUnlocked(seatId)
      }
    })
  }
}

export const ticketHub = new TicketHubService()
