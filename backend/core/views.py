from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .dashboard import get_dashboard_kpis
from .search import global_search


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    def list(self, request):
        data = get_dashboard_kpis()
        return Response({"success": True, "data": data})

    @action(detail=False, methods=["get"])
    def summary(self, request):
        data = get_dashboard_kpis()
        return Response({"success": True, "data": data})


class SearchViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    def list(self, request):
        query = request.query_params.get("q", "")
        if not query or len(query.strip()) < 2:
            return Response(
                {"success": False, "message": "Query must be at least 2 characters"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        results = global_search(query)
        return Response({"success": True, "data": results})


class BackupViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAdminUser,)

    @action(detail=False, methods=["post"])
    def create(self, request):
        from infrastructure.backup import run_backup
        result = run_backup()
        if "error" in result:
            return Response(
                {"success": False, "message": result["error"]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response({"success": True, "data": result})

    @action(detail=False, methods=["post"])
    def pg_dump(self, request):
        from infrastructure.backup import run_pg_backup
        result = run_pg_backup()
        if "error" in result:
            return Response(
                {"success": False, "message": result["error"]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response({"success": True, "data": result})
