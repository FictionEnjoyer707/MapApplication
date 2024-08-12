using MapApplication.Services;
using MapApplication.Services;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System.Data;
using System.Data.SqlClient;

namespace MapApplication.Interface
{
    public class GenericRepository : Repository<Point>, IGenericRepository
    {

        protected PointDbContext _context;
        public GenericRepository(PointDbContext context) : base(context)
        {
            _context = context;
        
        }

        public ApiResponse<Point> Update(int id, Point point)
        {

            try
            {
                if (point == null || id != point.Id)
                {
                    return ApiResponse<Point>.ErrorResponse("Invalid Id");
                }
                Point pointFromDb = _context.Points.ToList().FirstOrDefault(x => x.Id == id);
                if (pointFromDb == null)
                {
                    return ApiResponse<Point>.ErrorResponse("Not found");
                }

                pointFromDb.Wkt = point.Wkt;
                pointFromDb.Name = point.Name;

                return ApiResponse<Point>.SuccessResponse("Point Successfuly uptaded", point);
            }
            catch (Exception ex)
            {

                Console.Error.WriteLine($"An error occurred: {ex.Message}");

                var errorResponse = new ApiResponse<Point>(false, "Unexpected Error", null);
                return errorResponse;
            }
        }


    }
}

        