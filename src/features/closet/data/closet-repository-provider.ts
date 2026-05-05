import {
  mockClosetRepository,
  type ClosetDataRepository,
} from "@/features/closet/data/closet-repository";

let activeClosetRepository: ClosetDataRepository = mockClosetRepository;

export function getClosetRepository(): ClosetDataRepository {
  return activeClosetRepository;
}

export function setClosetRepository(repository: ClosetDataRepository) {
  activeClosetRepository = repository;
}
