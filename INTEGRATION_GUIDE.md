# Integration Guide - Testimonials Update

## Quick Start

### For Frontend Developers

1. **Footer Component Changes**
   - Location: `app/components/layout/Footer.tsx`
   - New contact: +1 408 360 0362, 45 City Plaza, Berlin 10117, Germany
   - Automatically updates everywhere Footer is used

2. **Testimonials on Homepage**
   - Location: `app/page.tsx`
   - Now displays 120 testimonials from 25 countries
   - Rotates every 24 hours (instead of 5 seconds)
   - Access via admin panel to manage

3. **Admin Testimonials Page**
   - URL: `/admin/dashboard/testimonials`
   - Full CRUD interface for managing testimonials
   - Requires admin/super_admin role
   - Search, filter, pagination included

### For Backend Developers

1. **New Testimonial Module**
   - Location: `src/testimonial/`
   - Automatically imported in `app.module.ts`
   - 6 API endpoints for CRUD operations

2. **Database Schema**
   ```typescript
   interface Testimonial {
     _id: ObjectId;
     name: string;
     role: string;
     location: string;
     image: string;          // emoji
     content: string;
     profit: string;
     active: boolean;        // soft delete
     createdBy: ObjectId;    // admin who created
     createdAt: Date;
     updatedAt: Date;
   }
   ```

3. **API Documentation**
   ```
   GET    /api/v1/testimonials?page=1&limit=50
   GET    /api/v1/testimonials/random?count=3
   GET    /api/v1/testimonials/:id
   POST   /api/v1/testimonials          [Admin]
   PUT    /api/v1/testimonials/:id      [Admin]
   DELETE /api/v1/testimonials/:id      [Admin]
   ```

---

## API Usage Examples

### Get All Testimonials (Public)
```bash
curl -X GET http://localhost:3001/api/v1/testimonials?page=1&limit=20
```

### Get Random Testimonials (Public)
```bash
curl -X GET http://localhost:3001/api/v1/testimonials/random?count=5
```

### Get Single Testimonial (Public)
```bash
curl -X GET http://localhost:3001/api/v1/testimonials/65a1b2c3d4e5f6g7h8i9j0k1
```

### Create Testimonial (Admin Only)
```bash
curl -X POST http://localhost:3001/api/v1/testimonials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "role": "Entrepreneur",
    "location": "🇺🇸 USA",
    "image": "👨‍💼",
    "content": "Amazing platform! Highly recommended.",
    "profit": "+$50,000"
  }'
```

### Update Testimonial (Admin Only)
```bash
curl -X PUT http://localhost:3001/api/v1/testimonials/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profit": "+$75,000",
    "content": "Updated testimonial text here."
  }'
```

### Delete Testimonial (Admin Only - Soft Delete)
```bash
curl -X DELETE http://localhost:3001/api/v1/testimonials/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Integration

### Display Testimonials on Homepage

```typescript
import { useEffect, useState } from 'react';
import { api } from '@/app/lib/api';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    // Fetch random testimonials
    api.get('/api/v1/testimonials/random?count=3')
      .then(res => setTestimonials(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="grid grid-cols-3 gap-8">
      {testimonials.map(t => (
        <div key={t._id} className="p-6 bg-dark-800 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{t.image}</span>
            <div>
              <h3 className="font-bold text-white">{t.name}</h3>
              <p className="text-gray-400 text-sm">{t.role}</p>
              <p className="text-gray-400 text-sm">{t.location}</p>
            </div>
          </div>
          <p className="mt-4 text-gray-300">{t.content}</p>
          <p className="mt-2 text-primary-400 font-bold">{t.profit}</p>
        </div>
      ))}
    </div>
  );
}
```

### Access Admin Dashboard

```typescript
// app/admin/dashboard/testimonials/page.tsx
// Already implemented and ready to use
// Just access: http://localhost:3000/admin/dashboard/testimonials
```

---

## Database Setup

### Auto Setup (Recommended)
The MongoDB collection is created automatically when the application starts. Just ensure:
1. MongoDB is running
2. Connection string is correct in `.env`
3. Backend application starts without errors

### Manual Setup (Optional)
```javascript
// Run in MongoDB shell or Compass
db.testimonials.insertOne({
  name: "Sample Testimonial",
  role: "User",
  location: "🌍 Global",
  image: "👨‍💼",
  content: "This is a sample testimonial.",
  profit: "+$10,000",
  active: true,
  createdBy: ObjectId("...admin_id..."),
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Create Index (Performance)
```javascript
db.testimonials.createIndex({ active: 1 });
db.testimonials.createIndex({ createdAt: -1 });
db.testimonials.createIndex({ name: "text", content: "text" });
```

---

## Environment Variables

No new environment variables required. Uses existing:
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Authentication
- `JWT_REFRESH_SECRET` - Token refresh

---

## Error Handling

### Common Errors and Solutions

**401 Unauthorized**
```
Error: Testimonial creation failed
Reason: JWT token missing or invalid
Solution: Ensure Authorization header is set with valid token
```

**403 Forbidden**
```
Error: Access denied
Reason: User role is not admin/super_admin
Solution: Use admin account or contact super_admin
```

**404 Not Found**
```
Error: Testimonial not found
Reason: ID doesn't exist or was soft deleted
Solution: Check testimonial ID or restore if needed
```

**400 Bad Request**
```
Error: Validation failed
Reason: Missing required fields
Solution: Check all required fields are provided:
  - name (min 2 chars)
  - role (min 2 chars)
  - location (required)
  - image (emoji required)
  - content (min 10 chars)
  - profit (required)
```

---

## Testing

### Unit Tests
```bash
# Test testimonial service
npm run test src/testimonial/testimonial.service.spec.ts

# Test testimonial controller
npm run test src/testimonial/testimonial.controller.spec.ts
```

### Integration Tests
```bash
# Test API endpoints
npm run test:e2e src/testimonial/testimonial.e2e.spec.ts
```

### Manual Testing Checklist
- [ ] Admin can create testimonial
- [ ] Admin can edit testimonial
- [ ] Admin can delete testimonial
- [ ] Search works correctly
- [ ] Pagination works
- [ ] Emoji avatar selector works
- [ ] Homepage displays testimonials
- [ ] Footer shows new contact info
- [ ] Authorization checks work
- [ ] Form validation works

---

## Troubleshooting

### Testimonials Not Appearing
1. Check if testimonials exist: `db.testimonials.find()`
2. Verify `active: true` flag
3. Check API response: `/api/v1/testimonials`
4. Check browser console for errors

### Admin Panel Not Loading
1. Verify JWT token is valid
2. Check user has admin/super_admin role
3. Verify API endpoints are accessible
4. Check network tab for failed requests

### Footer Not Showing New Contact
1. Clear browser cache
2. Restart dev server
3. Verify file changes in Footer.tsx
4. Check CSS is loading correctly

### Database Connection Issues
1. Verify MongoDB is running: `mongod --version`
2. Check MONGODB_URI in .env
3. Verify credentials are correct
4. Check network connectivity to MongoDB Atlas

---

## Maintenance

### Regular Tasks
- [ ] Monitor testimonials collection size
- [ ] Backup testimonials data monthly
- [ ] Review inactive testimonials
- [ ] Update testimonials seasonally
- [ ] Monitor API performance

### Database Maintenance
```javascript
// Remove inactive testimonials after 90 days
db.testimonials.deleteMany({
  active: false,
  updatedAt: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
});

// Archive old testimonials
db.testimonials.updateMany(
  { createdAt: { $lt: new Date(Date.now() - 365*24*60*60*1000) } },
  { $set: { archived: true } }
);
```

---

## Performance Tips

1. **Cache testimonials in Redis** (optional)
   ```typescript
   // Cache random testimonials for 24 hours
   const cached = await redis.get('random_testimonials');
   if (!cached) {
     const data = await getRandomTestimonials(3);
     await redis.set('random_testimonials', JSON.stringify(data), 86400);
   }
   ```

2. **Use pagination** for large lists
   ```bash
   /api/v1/testimonials?page=1&limit=50
   ```

3. **Add database indexes** (already recommended above)

4. **Implement CDN** for images (testimonial avatars are emojis - no CDN needed)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024 | Initial implementation with 120 testimonials |

---

## Support Resources

- **API Documentation:** See `TESTIMONIALS_UPDATE.md`
- **Implementation Details:** See `IMPLEMENTATION_CHECKLIST.md`
- **Database Schema:** See `testimonial.schema.ts`
- **Admin UI:** See `app/admin/dashboard/testimonials/page.tsx`

---

## Contact

For questions or issues:
1. Check this guide first
2. Review error messages in console
3. Check database directly
4. Contact development team

---

**Last Updated:** 2024
**Status:** Production Ready ✅
