using Microsoft.EntityFrameworkCore;
using System;

namespace WebRTCDemo.Models
{
    

        public class WebRTCDataContext : DbContext
        {
            public WebRTCDataContext(DbContextOptions<WebRTCDataContext> options) : base(options) { }

          
            public DbSet<Offers> Offers { get; set; }
            public DbSet<MediaStreams> MediaStreams { get; set; }
        }


    
}
