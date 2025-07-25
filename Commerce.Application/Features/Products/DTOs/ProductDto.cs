namespace Commerce.Application.Features.Products.DTOs
{
    public record ProductDto(
        int ID, 
        string Name, 
        string Description, 
        decimal Price, 
        int Stock, 
        string ImageUrl, 
        string SKU, 
        int CategoryId, 
        bool IsActive, 
        DateTime CreatedAt
    );
}
