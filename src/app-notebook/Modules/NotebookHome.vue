<template>
  <div class="container mt-4">
    <CherryWebChat
      :participants="participants"
      :titleImageUrl="titleImageUrl"
      :onMessageWasSent="onMessageWasSent"
      :messageList="messageList"
      :newMessagesCount="newMessagesCount"
      :isOpen="isChatOpen"
      :close="closeChat"
      :open="openChat"
      :showEmoji="true"
      :showFile="true"
      :showEdition="true"
      :showDeletion="true"
      :showTypingIndicator="showTypingIndicator"
      :showLauncher="true"
      :showCloseButton="true"
      :colors="colors"
      :alwaysScrollToBottom="alwaysScrollToBottom"
      :disableUserListToggle="false"
      :messageStyling="messageStyling"
      @onType="handleOnType"
      @edit="editMessage"
    />
  </div>
</template>

<script>
import Vue from "vue";
import CherryWebChat from "@cherrybase/cherry-webchat";
Vue.use(CherryWebChat);

export default {
  components: {},
  data() {
    return {
      participants: [
        {
          id: "user1",
          name: "Matteo",
          imageUrl: "https://avatars3.githubusercontent.com/u/1915989?s=230&v=4",
        },
        {
          id: "user2",
          name: "Support",
          imageUrl: "https://avatars3.githubusercontent.com/u/37018832?s=200&v=4",
        },
      ], // the list of all the participant of the conversation. `name` is the user name, `id` is used to establish the author of a message, `imageUrl` is supposed to be the user avatar.
      titleImageUrl: "https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png",
      messageList: [
        { type: "text", author: `me`, data: { text: `Say yes!` } },
        { type: "text", author: `user1`, data: { text: `No.` } },
      ], // the list of the messages to show, can be paginated and adjusted dynamically
      newMessagesCount: 0,
      isChatOpen: false, // to determine whether the chat window should be open or closed
      showTypingIndicator: "", // when set to a value matching the participant.id it shows the typing indicator for the specific user
      colors: {
        header: {
          bg: "#4e8cff",
          text: "#ffffff",
        },
        launcher: {
          bg: "#4e8cff",
        },
        messageList: {
          bg: "#ffffff",
        },
        sentMessage: {
          bg: "#4e8cff",
          text: "#ffffff",
        },
        receivedMessage: {
          bg: "#eaeaea",
          text: "#222222",
        },
        userInput: {
          bg: "#f4f7f9",
          text: "#565867",
        },
      }, // specifies the color scheme for the component
      alwaysScrollToBottom: false, // when set to true always scrolls the chat to the bottom when new events are in (new message, user starts typing...)
      messageStyling: true, // enables *bold* /emph/ _underline_ and such (more info at github.com/mattezza/msgdown),
      polling : false
    };
  },
  mounted() {
    
  },
  methods: {
    async onMessageWasSent(message) {
      let resp = await this.$service.post("/api/messages", message);
      // called when the user sends a message
      this.messageList = [...this.messageList, ...resp.results];
    },
    async getMessages() {
      let resp = await this.$service.get("/api/messages");
      if (resp.results.length > 0) {
        this.messageList = [...this.messageList, ...resp.results];
      }
    },
    async pollMessage() {
      try {
        await this.getMessages();
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(async () => {
          await this.pollMessage();
        }, 2000);
      }
    },
    openChat() {
      if(!this.polling){
         this.pollMessage();
         this.polling = true;
      }
     
      // called when the user clicks on the fab button to open the chat
      this.isChatOpen = true;
      this.newMessagesCount = 0;
    },
    closeChat() {
      // called when the user clicks on the botton to close the chat
      this.isChatOpen = false;
    },
    handleScrollToTop() {
      // called when the user scrolls message list to top
      // leverage pagination for loading another page of messages
    },
    handleOnType() {
      console.log("Emit typing event");
    },
    editMessage(message) {
      const m = this.messageList.find((m) => m.id === message.id);
      m.isEdited = true;
      m.data.text = message.data.text;
    },
  },
};
</script>

<style>
.container {
  max-width: 600px;
}
</style>
