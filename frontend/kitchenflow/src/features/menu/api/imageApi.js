import { apiClient } from '../../../api/apiClient'

export const imageApi = {
  // POST /api/images?resize={bool} (ROLE_ADMIN)
  async uploadImage(file, resize = true) {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post(`/images?resize=${Boolean(resize)}`, formData)
  },

  // DELETE /api/images?id={imageId} (ROLE_ADMIN)
  async deleteImage(imageId) {
    return apiClient.delete(`/images?id=${encodeURIComponent(imageId)}`)
  }
}


