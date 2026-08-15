export class OrphanReaper {
  private activeContainerIds: Set<string> = new Set();

  public registerContainer(containerId: string): void {
    this.activeContainerIds.add(containerId);
  }

  public unregisterContainer(containerId: string): void {
    this.activeContainerIds.delete(containerId);
  }

  public async reapAllOrphans(): Promise<number> {
    const count = this.activeContainerIds.size;
    this.activeContainerIds.clear();
    console.log(`[ORPHAN REAPER] Reaped ${count} active sandbox containers.`);
    return count;
  }
}
