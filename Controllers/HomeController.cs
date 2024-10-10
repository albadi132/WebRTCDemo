using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using WebRTCDemo.Models;

namespace WebRTCDemo.Controllers
{
	public class HomeController : Controller
	{
		private readonly ILogger<HomeController> _logger;
        //ad dbcontext here
		private readonly WebRTCDataContext _context;

        public HomeController(ILogger<HomeController> logger, WebRTCDataContext context)
        {
            _logger = logger;
            _context = context;
        }

        public IActionResult Index()
		{
			return View();
		}

		[HttpGet]
        public async Task<IActionResult> Offer()
        {
			var res = new List<Res>();
            //get offer from database
            var offers = await _context.Offers.ToListAsync();

            foreach (var offer in offers)
			{
                var media = await _context.MediaStreams.FirstOrDefaultAsync(x => x.Client == offer.ConnectionId);

                res.Add(new Res()
                {
                    ClientOffer = offer.ClientOffer,
                    ConnectionId = offer.ConnectionId,
                    Media = media.Media
                });


            }
                return Json(res);
        }
        public IActionResult Privacy()
		{
			return View();
		}

		[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
		public IActionResult Error()
		{
			return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
		}
	}
}
