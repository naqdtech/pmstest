import frappe
from frappe.model.document import Document


class ClientMaster(Document):
	def before_save(self):
		if self.pan:
			self.pan = self.pan.strip().upper()
		if self.gstin:
			self.gstin = self.gstin.strip().upper()
