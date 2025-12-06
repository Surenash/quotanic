import uuid
import shutil
from pathlib import Path
from unittest.mock import patch, MagicMock
from rest_framework.test import APITestCase
from django.conf import settings
from accounts.models import User, UserRole
from .models import Design, DesignStatus
from .tasks import analyze_cad_file, PYTHONOCC_AVAILABLE

# Path to the sample STEP file
SAMPLE_STEP_FILE_PATH = Path(__file__).parent / "test_data" / "cube_10mm.step"

class StepAnalysisTests(APITestCase):

    def setUp(self):
        self.customer_user = User.objects.create_user(
            email="step_test_user@example.com", password="Password123!",
            company_name="STEP Test Corp", role=UserRole.CUSTOMER
        )
        self.design_pending_step = Design.objects.create(
            customer=self.customer_user,
            design_name="STEP Design for Analysis",
            s3_file_key=f"uploads/designs/{self.customer_user.id}/cube_10mm.step",
            material="Steel", quantity=1, status=DesignStatus.PENDING_ANALYSIS
        )

    def _mock_s3_download_file(self, s3_client_mock, source_file_path=SAMPLE_STEP_FILE_PATH):
        """Helper to mock the S3 download_file to copy a local sample file."""
        def copier(Bucket, Key, TargetFilePath):
            shutil.copy(source_file_path, TargetFilePath)
        s3_client_mock.download_file.side_effect = copier
        return s3_client_mock

    @patch('designs.tasks.boto3.client')
    def test_analyze_cad_file_task_success_step(self, mock_boto_client_constructor):
        if not PYTHONOCC_AVAILABLE:
            self.skipTest("pythonocc-core not available, skipping STEP analysis test")

        mock_s3_instance = MagicMock()
        self._mock_s3_download_file(mock_s3_instance, SAMPLE_STEP_FILE_PATH)
        mock_boto_client_constructor.return_value = mock_s3_instance

        result_message = analyze_cad_file(self.design_pending_step.id)

        self.design_pending_step.refresh_from_db()
        self.assertEqual(self.design_pending_step.status, DesignStatus.ANALYSIS_COMPLETE)
        geom_data = self.design_pending_step.geometric_data
        self.assertIsNotNone(geom_data)

        # Expected values for a 10x10x10 mm cube
        # Volume: 1000 mm^3 = 1.0 cm^3
        self.assertAlmostEqual(geom_data.get("volume_cm3"), 1.0, places=1)
        
        # Bounding Box
        bbox = geom_data.get("bbox_mm", [])
        self.assertEqual(len(bbox), 3)
        for dim in bbox: self.assertAlmostEqual(dim, 10.0, places=1)
        
        # Surface Area: 600 mm^2 = 6.0 cm^2
        self.assertAlmostEqual(geom_data.get("surface_area_cm2"), 6.0, places=1)
        
        # Complexity: A cube has 1 solid, 1 shell, 6 faces, 12 edges, 8 vertices
        self.assertEqual(geom_data.get("num_solids"), 1)
        self.assertEqual(geom_data.get("num_faces"), 6)
        self.assertEqual(geom_data.get("num_edges"), 12)
        self.assertEqual(geom_data.get("num_vertices"), 8)
        
        self.assertTrue(geom_data.get("analysis_engine") == "pythonocc-core")
        self.assertIn("Successfully processed", result_message)
        mock_s3_instance.download_file.assert_called_once()
