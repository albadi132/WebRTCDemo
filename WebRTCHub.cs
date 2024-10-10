using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using WebRTCDemo.Models;

namespace WebRTCDemo
{


    public class WebRTCHub : Hub
    {



        private readonly IHubContext<ChatHub> _chatHub;
        public WebRTCHub( IHubContext<ChatHub> chatHub)
        {
            _chatHub = chatHub;
        }

      
       
      

        public async Task SendIceCandidate(string candidate, string toConnectionId)
        {
			
			await Clients.Client(toConnectionId).SendAsync("ReceiveIceCandidate", candidate , Context.ConnectionId);
        }

        public async Task AskForOffer()
        {
			_chatHub.Clients.All.SendAsync("ReceiveMessage", Context.ConnectionId , "connected");
			await Clients.AllExcept(Context.ConnectionId).SendAsync("JoinRoom" , Context.ConnectionId);
        }

        public async Task SendOfferForNewUser(string offer , string forUserId)
        {
			//stop for 2
			System.Threading.Thread.Sleep(2000);

			_chatHub.Clients.All.SendAsync("ReceiveMessage", forUserId, $"AskForOffer from {Context.ConnectionId}");

			await Clients.Client(forUserId).SendAsync("ResaveNewOffer", Context.ConnectionId , offer);
		
		}


		public async Task SendAnswerForUser(string answer, string fromUserId)
        {
			_chatHub.Clients.All.SendAsync("ReceiveMessage", fromUserId, $"SendAnswerForUser from {Context.ConnectionId}");
			await Clients.Client(fromUserId).SendAsync("ReceiveNewAnswer", Context.ConnectionId, answer);
        }

        public override async Task OnConnectedAsync()
        {
          
           await AskForOffer();
     
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
          
            await Clients.AllExcept(Context.ConnectionId).SendAsync("DisconnectedRoom", Context.ConnectionId);

            await base.OnDisconnectedAsync(exception);
        }
    }
}
