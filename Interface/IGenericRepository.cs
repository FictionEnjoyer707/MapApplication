using Microsoft.AspNetCore.Mvc;
using MapApplication.Services;

namespace MapApplication.Interface
{
    public interface IGenericRepository : IRepository<Point> {
        ApiResponse<Point> Update(int id, Point point);    
    
    }
}
