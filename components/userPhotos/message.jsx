import React, { Component } from "react";
import "./style.css";

class Message extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.replaceMentions = this.replaceMentions.bind(this);
  }

  replaceMentions(message, users) {
    let mentions = users.map((obj) => {
      return "@[" + obj.display + "](" + obj.id + ")";
    });
    console.log(mentions);
    let modifiedText = message;
    mentions.forEach((mention) => {
      const [mentionText, userId] = mention.match(/\[([^\]]+)\]\(([^)]+)\)/);
      const user = mentions.find((u) => u.includes(userId));

      if (user) {
        const name = user.match(/\[([^\]]+)\]/)[1];
        let userIdRedirect = users.find((u) => u.display === name).id;
        const userLink = `<a href="/photo-share.html?#/users/${userIdRedirect}" style="color: red;">${name}</a>`;
        modifiedText = modifiedText.replace(mention, userLink);
      }
    });

    return <div dangerouslySetInnerHTML={{ __html: modifiedText }} />;
  }

  render() {
    const { msg, users } = this.props;
    const modifiedMessage = this.replaceMentions(msg, users);

    return <div className="msgDiv">{modifiedMessage}</div>;
  }
}

export default Message;
