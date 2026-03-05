from django.urls import path
from .views import QuoteListCreateView, QuoteDetailView, QuoteListView

# These patterns are included under /api/designs/{design_id}/
design_specific_quote_urlpatterns = [
    path('', QuoteListCreateView.as_view(), name='design-quote-list-create'),
]

# These patterns are included under /api/quotes/ (from gmqp_project/urls.py)
urlpatterns = [
    path('', QuoteListView.as_view(), name='quote-list'),  # /api/quotes/
    path('<uuid:id>/', QuoteDetailView.as_view(), name='quote-detail'),  # /api/quotes/{id}/
]
