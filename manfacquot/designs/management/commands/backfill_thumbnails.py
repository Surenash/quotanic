import os
from django.core.management.base import BaseCommand
from django.conf import settings
from designs.models import Design, DesignStatus
from designs.tasks import generate_snapshot
import boto3

class Command(BaseCommand):
    help = 'Generates isometric snapshots for all existing designs that lack them.'

    def handle(self, *args, **options):
        designs = Design.objects.filter(status=DesignStatus.ANALYSIS_COMPLETE)
        self.stdout.write(f"Found {designs.count()} completed designs to check.")

        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
            endpoint_url=settings.AWS_S3_ENDPOINT_URL
        )

        success_count = 0
        fail_count = 0

        for design in designs:
            geo_data = design.geometric_data or {}
            if geo_data.get('thumbnail_key'):
                continue

            self.stdout.write(f"Processing Design: {design.id} ({design.design_name})...")
            
            # Use original file for snapshot
            file_key = design.s3_file_key
            if not file_key:
                continue

            local_path = os.path.join(settings.MEDIA_ROOT, file_key)
            
            # If on S3, we need to download it first
            is_temp = False
            if not settings.USE_LOCAL_STORAGE or not os.path.exists(local_path):
                is_temp = True
                local_path = f"/tmp/{os.path.basename(file_key)}"
                try:
                    s3_client.download_file(settings.AWS_STORAGE_BUCKET_NAME, file_key, local_path)
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to download {file_key}: {e}"))
                    fail_count += 1
                    continue

            thumb_path = local_path.rsplit('.', 1)[0] + '_thumb.png'
            try:
                if generate_snapshot(local_path, thumb_path):
                    thumb_key = file_key.rsplit('.', 1)[0] + '_thumb.png'
                    
                    if not settings.USE_LOCAL_STORAGE:
                        s3_client.upload_file(thumb_path, settings.AWS_STORAGE_BUCKET_NAME, thumb_key)
                    
                    geo_data['thumbnail_key'] = thumb_key
                    design.geometric_data = geo_data
                    design.save(update_fields=['geometric_data'])
                    
                    self.stdout.write(self.style.SUCCESS(f"Generated thumbnail for {design.design_name}"))
                    success_count += 1
                else:
                    self.stdout.write(self.style.WARNING(f"Snapshot generation failed for {design.design_name}"))
                    fail_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error processing {design.design_name}: {e}"))
                fail_count += 1
            finally:
                if is_temp and os.path.exists(local_path):
                    os.remove(local_path)
                if os.path.exists(thumb_path):
                    os.remove(thumb_path)

        self.stdout.write(self.style.SUCCESS(f"Backfill complete. Success: {success_count}, Fail: {fail_count}"))
