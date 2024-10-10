namespace WebRTCDemo.Models
{
    public class Offers
    {
        public int Id { get; set; }
        public string ClientOffer { get; set; }
        public string ConnectionId { get; set; }
    }

    public class MediaStreams
    {
        public int Id { get; set; }
        public string Client { get; set; }
        public string Media { get; set; }
    }

    public class Res
    {
        public string ClientOffer { get; set; }
        public string ConnectionId { get; set; }

        public string Media { get; set; }
    }
}
