// Controllers/TestController.cs
using Microsoft.AspNetCore.Mvc;
using System;

[ApiController]
[Route("[controller]")]
public class TestExcController : ControllerBase
{
    [HttpGet("throw-exception")]
    public IActionResult ThrowException()
    {
        throw new Exception("Bu bir test hatasıdır!");
    }

    [HttpGet("throw-custom-exception")]
    public IActionResult ThrowCustomException()
    {

        throw new InvalidOperationException("Bu bir geçersiz işlem hatasıdır.");
    }
}