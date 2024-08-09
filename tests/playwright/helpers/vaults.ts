import { createKongResource } from '@pw/commands/createKongResource'
import { VAULTS } from '@pw/fixtures/vaults'

export const createVaults = async () => {
  // Create vaults to test the vault secret picker
  for (const vault of VAULTS) {
    await createKongResource('/vaults', vault)
  }
}
