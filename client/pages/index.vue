<template>
  <div class="w-[50%] mx-auto">
      <div class="h-[70vh] mt-16 overflow-y-auto" id="scroll-box">
        <messageBox :message="message" v-for="message in messages">
          {{ message.message }}
        </messageBox>
      </div>
      <form @submit.prevent="sendMessage" class="flex mt-4">
        <textInput placeholder="Nowa wiadomość" type="text" class="w-[80%]" v-model="newMessage" />
        <primaryButton>Send message</primaryButton>    
      </form>
      <ErrorAlert v-if="!webSocketConnection">Połączenie zostało zakończone! Proszę odświerzyć przeglądarkę.</ErrorAlert>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      newMessage: '',
      ws: new WebSocket('ws://localhost:3000'),
      messages: [],
      offset: 0,
      webSocketConnection: true
    }
  },
  mounted() {
    const scrollBox = document.getElementById('scroll-box')
    
    scrollBox.addEventListener('scroll', () => {
      if (scrollBox.scrollTop === 0) {
        this.getMoreMessages()
      }
    })
    
    axios.get(`http://localhost:3000`).then(res => {
      this.messages = res.data
      this.scrollToBottom()
      this.offset += 10
    })

    this.ws.onmessage = event => {
      if (JSON.parse(event.data).type === 'reaction') {
        const messageId = JSON.parse(event.data).message_id;
        const message = this.messages.find(message => message.id == messageId)

        message.reactions.push(JSON.parse(event.data).reaction)
      } else {
        this.messages = [...this.messages, JSON.parse(event.data)]
        this.scrollToBottom()
      }
    }

    this.ws.addEventListener('open', () => {
      this.webSocketConnection = true
    })

    this.ws.onclose = () => {
      this.webSocketConnection = false
    }
  },
  methods: {
    async sendMessage() {
      await this.ws.send(this.newMessage)
      this.newMessage = ''
      this.scrollToBottom()
    },
    scrollToBottom() {
      this.$nextTick(() => {
          const scrollBox = document.getElementById('scroll-box')
          scrollBox.scrollTop = scrollBox.scrollHeight
        })
    },
    getMoreMessages() {
      axios.get(`http://localhost:3000?offset=${this.offset}`).then(res => {
        res.data.forEach(element => {
          this.messages = [element, ...this.messages]
        });
        const box = document.getElementById('scroll-box')

        this.offset += res.data.length
      })
    }
  }
}
</script>
