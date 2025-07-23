using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Commerce.Application.Features.Categories.Commands;
using Commerce.Application.Features.Categories.Queries;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Commerce.API.Controllers
{
    [ApiController]
    [Route("[controller]")]

    public class CategoriesController : ControllerBase
    {

        private readonly IMediator _mediator;

        public CategoriesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("getAll")]
        public async Task<IActionResult> GetAll()
        {
            var query = new GetAllCategoriesQuery();
            var categories = await _mediator.Send(query);
            return Ok(categories);
        }

        [HttpPost]
        [Route("new")]
        [Authorize(Roles = "Admin")]

        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryCommand command)
        {
            if (command == null || string.IsNullOrWhiteSpace(command.Name))
            {
                return BadRequest("Invalid category data.");
            }
            var categoryId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetAll), new { id = categoryId }, null);
        }

        [HttpPost]
        [Route("update")]
        [Authorize(Roles = "Admin")]

        public async Task<IActionResult> UpdateCategory([FromBody] UpdateCategoryCommand command)
        {
            if (!string.IsNullOrWhiteSpace(command.Name))
            {
                return BadRequest("Invalid Data");
            }
            var categoryId = await _mediator.Send(command);
            return Ok();
        }



    }
}
