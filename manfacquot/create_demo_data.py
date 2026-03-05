import os
import django
import random
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gmqp_project.settings')
django.setup()

from accounts.models import User, Manufacturer, Customer, UserRole
from designs.models import Design
from quotes.models import Quote, QuoteStatus
from orders.models import Order, OrderStatus

def create_demo_data():
    print("Starting demo data generation...")

    # 1. Create Demo Manufacturer
    mfg_email = 'demo_mfg@quotanic.com'
    mfg_password = 'password123'
    
    try:
        user_mfg = User.objects.get(email=mfg_email)
        print(f"Manufacturer {mfg_email} already exists. Using existing.")
    except User.DoesNotExist:
        user_mfg = User.objects.create_user(
            email=mfg_email, 
            password=mfg_password, 
            company_name="Quotanic Precision Mfg",
            role=UserRole.MANUFACTURER
        )
        Manufacturer.objects.create(
            user=user_mfg,
            location="San Francisco, CA",
            about="High-precision CNC machining and 3D printing services.",
            capabilities={"cnc": True, "3d_printing": True},
            certifications=["ISO 9001:2015", "AS9100"],
            average_rating=4.8
        )
        print(f"Created Manufacturer: {mfg_email}")

    # 2. Create Dummy Customers
    customer_companies = ["AeroSpace Dynamics", "MedTech Innovators", "AutoParts Global", "ConsumerGadgets Inc.", "Robotics Next"]
    customers = []
    
    for company in customer_companies:
        email = f"purchasing@{company.lower().replace(' ', '').replace('.', '')}.com"
        try:
            cust = User.objects.get(email=email)
            print(f"Customer {email} already exists.")
        except User.DoesNotExist:
            cust = User.objects.create_user(
                email=email,
                password='password123',
                company_name=company,
                role=UserRole.CUSTOMER
            )
            print(f"Created Customer: {email}")
        customers.append(cust)

    # 3. Generate Historical Data (Last 6 Months)
    materials = ["Aluminium 6061", "Stainless Steel 304", "Titanium Grade 5", "ABS Plastic", "Polycarbonate"]
    processes = ["CNC Machining", "Injection Molding", "Sheet Metal", "3D Printing FDM", "SLA Printing"]
    part_names = ["Main Housing", "Mounting Bracket", "Gear Shaft", "Enclosure Shell", "Sensor Base", "Heat Sink", "Connector Pin", "Control Panel"]

    now = timezone.now()
    six_months_ago = now - timedelta(days=180)
    
    # We want a funnel roughly like: 100 designs -> 90 quotes -> 60 accepted (orders) -> 45 completed, 10 in production, 5 cancelled
    
    total_designs_to_create = 60
    
    for i in range(total_designs_to_create):
        # Determine a random date in the last 6 months
        days_ago = random.randint(1, 180)
        creation_date = now - timedelta(days=days_ago)
        
        # Pick random attributes
        customer = random.choice(customers)
        material = random.choice(materials)
        process = random.choice(processes)
        name = random.choice(part_names) + f" v{random.randint(1,5)}"
        quantity = random.randint(10, 500)
        
        # Create Design
        design = Design.objects.create(
            customer=customer,
            design_name=name,
            material=material,
            manufacturing_process=process,
            quantity=quantity,
            urgency=random.choice(['standard', 'expedited']),
            packaging_requirements='standard',
            s3_file_key=f"demo_files/{uuid.uuid4()}.step"
        )
        # Override auto_now_add for created_at
        Design.objects.filter(pk=design.pk).update(created_at=creation_date, updated_at=creation_date)
        
        # Determine funnel progression
        # 10% just design (no quote yet)
        if random.random() < 0.1:
            continue
            
        # Create Quote
        is_accepted = random.random() < 0.7  # 70% acceptance rate
        quote_status = QuoteStatus.ACCEPTED if is_accepted else random.choice([QuoteStatus.PENDING, QuoteStatus.REJECTED, QuoteStatus.EXPIRED])
        
        price = Decimal(random.uniform(500.0, 15000.0)).quantize(Decimal('0.01'))
        lead_time = random.randint(5, 30)
        
        quote = Quote.objects.create(
            design=design,
            manufacturer=user_mfg,
            status=quote_status,
            price_usd=price,
            estimated_lead_time_days=lead_time,
            notes=f"Process: {process}. Standard stock used."
        )
        
        quote_date = creation_date + timedelta(days=random.randint(1, 4))
        Quote.objects.filter(pk=quote.pk).update(created_at=quote_date, updated_at=quote_date)
        
        # Create Order if accepted
        if is_accepted:
            # Order status distribution
            rand_status = random.random()
            if rand_status < 0.7:
                o_status = OrderStatus.COMPLETED
            elif rand_status < 0.8:
                o_status = OrderStatus.SHIPPED
            elif rand_status < 0.95:
                o_status = OrderStatus.IN_PRODUCTION
            else:
                o_status = OrderStatus.CANCELLED_BY_CUSTOMER
                
            # If the quote was recent (e.g. last 14 days), it's more likely to be in production
            if days_ago < 20 and o_status == OrderStatus.COMPLETED:
                o_status = OrderStatus.IN_PRODUCTION
                
            est_delivery = quote_date + timedelta(days=lead_time)
            
            order = Order.objects.create(
                design=design,
                accepted_quote=quote,
                customer=customer,
                manufacturer=user_mfg,
                status=o_status,
                order_total_price_usd=price,
                estimated_delivery_date=est_delivery.date(),
                shipping_address={"street": "123 Main St", "city": "Anytown", "country": "USA"}
            )
            
            # Update order dates
            order_create_date = quote_date + timedelta(days=random.randint(1, 3))
            
            if o_status in [OrderStatus.SHIPPED, OrderStatus.COMPLETED]:
                # 85% on-time delivery rate
                if random.random() < 0.85:
                    actual_ship = est_delivery - timedelta(days=random.randint(0, 3))
                else:
                    actual_ship = est_delivery + timedelta(days=random.randint(1, 5))
                    
                update_date = actual_ship + timedelta(days=2) # e.g. completion date
                
                Order.objects.filter(pk=order.pk).update(
                    created_at=order_create_date, 
                    updated_at=update_date,
                    actual_ship_date=actual_ship.date()
                )
            else:
                Order.objects.filter(pk=order.pk).update(
                    created_at=order_create_date,
                    updated_at=order_create_date + timedelta(days=1)
                )

    print(f"Successfully generated {total_designs_to_create} historical design funnels!")
    print(f"Login with: {mfg_email} / {mfg_password}")

if __name__ == "__main__":
    import uuid
    create_demo_data()
