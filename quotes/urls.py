from django.urls import path
from .views import QuoteListCreateView, QuoteDetailView, QuoteListView

# These patterns are included under /api/designs/{design_id}/
design_specific_quote_urlpatterns = [
    path('', QuoteListCreateView.as_view(), name='design-quote-list-create'),
]

# These patterns are included under /api/
urlpatterns = [
    path('quotes/', QuoteListView.as_view(), name='quote-list'),
    path('quotes/<uuid:id>/', QuoteDetailView.as_view(), name='quote-detail'),
]
