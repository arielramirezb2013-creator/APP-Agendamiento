"""
Capa de acceso a Cosmos DB · NoSQL API
Cada "container" funciona como una colección.
Particionado por /id para queries simples.
"""
from azure.cosmos import CosmosClient, PartitionKey, exceptions
from typing import Any
from ..config import get_settings

settings = get_settings()

# Containers · uno por tipo de documento
CONTAINERS = {
    "users":        {"pk": "/email"},
    "equipos":      {"pk": "/id"},
    "reservas":     {"pk": "/id"},
    "paquetes":     {"pk": "/id"},
    "planes":       {"pk": "/id"},
    "solicitudes":  {"pk": "/id"},
    "auditoria":    {"pk": "/user_email"},
}


class CosmosRepository:
    """Repositorio simple para operaciones CRUD contra Cosmos DB."""

    def __init__(self):
        self.client = CosmosClient(settings.cosmos_endpoint, settings.cosmos_key)
        self.db = self.client.create_database_if_not_exists(settings.cosmos_database)
        self._containers = {}
        for name, cfg in CONTAINERS.items():
            self._containers[name] = self.db.create_container_if_not_exists(
                id=name,
                partition_key=PartitionKey(path=cfg["pk"]),
                offer_throughput=400,  # mínimo Cosmos · ~ 24 USD/mes
            )

    def get_container(self, name: str):
        if name not in self._containers:
            raise ValueError(f"Container desconocido: {name}")
        return self._containers[name]

    def upsert(self, container: str, item: dict) -> dict:
        """Crea o actualiza un documento."""
        return self.get_container(container).upsert_item(item)

    def get(self, container: str, item_id: str, partition_key: str) -> dict | None:
        """Lee un documento por id."""
        try:
            return self.get_container(container).read_item(
                item=item_id, partition_key=partition_key
            )
        except exceptions.CosmosResourceNotFoundError:
            return None

    def query(self, container: str, query: str, parameters: list[dict] | None = None) -> list[dict]:
        """Ejecuta una query SQL contra el container."""
        return list(
            self.get_container(container).query_items(
                query=query,
                parameters=parameters or [],
                enable_cross_partition_query=True,
            )
        )

    def list_all(self, container: str) -> list[dict]:
        """Lista todos los documentos del container."""
        return self.query(container, "SELECT * FROM c")

    def delete(self, container: str, item_id: str, partition_key: str) -> bool:
        try:
            self.get_container(container).delete_item(
                item=item_id, partition_key=partition_key
            )
            return True
        except exceptions.CosmosResourceNotFoundError:
            return False


# Singleton
_repo: CosmosRepository | None = None


def get_repo() -> CosmosRepository:
    global _repo
    if _repo is None:
        _repo = CosmosRepository()
    return _repo
