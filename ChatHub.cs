using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace WebRTCDemo
{
    

    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendNotification(string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", message);
        }
    }


  

}