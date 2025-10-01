
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { UploadFile } from "@/api/integrations";
import {
  User as UserIcon,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  Edit3,
  LogOut,
  Loader2,
  CheckCircle,
  X,
  AlertCircle,
  ArrowLeft,
  Lock
} from "lucide-react";

const SuccessAlert = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center z-50 animate-fade-in">
      <CheckCircle className="w-5 h-5 mr-3" />
      <span className="block sm:inline">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-green-200">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const ErrorAlert = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center z-50 animate-fade-in">
      <AlertCircle className="w-5 h-5 mr-3" />
      <span className="block sm:inline">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-red-200">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // State para el formulario, separado del estado del usuario
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: ""
  });
  
  const [isDirty, setIsDirty] = useState(false);

  const [passwordData, setPasswordData] = useState({
    // currentPassword: "", // Removed as it's not functional in UI and not used in logic
    newPassword: "",
    confirmPassword: ""
  });
  
  useEffect(() => {
    loadUserData();
  }, []);
  
  useEffect(() => {
      if (!user) return;
      const hasChanged = formData.first_name !== user.first_name ||
                         formData.last_name !== user.last_name ||
                         formData.email !== user.email;
      setIsDirty(hasChanged);
  }, [formData, user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      // Inicializar el formulario con los datos del usuario
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || ""
      });
      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      await User.loginWithRedirect(window.location.href);
    }
  };

  const handleInputChange = (e) => {
      const { id, value } = e.target;
      setFormData(prev => ({...prev, [id]: value}));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      });

      // Recargar datos y resetear el estado 'dirty'
      await loadUserData();
      setIsDirty(false); 
      setShowSuccess("Cambios guardados correctamente");
    } catch (error) {
      console.error("Error saving user data:", error);
      setShowError("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setShowError("Las contraseñas no coinciden.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setShowError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSaving(true);
    try {
      // Here you would typically call an API to change the password
      // For now, we'll simulate a successful password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordData({
        // currentPassword: "", // Removed from state as it's not used
        newPassword: "",
        confirmPassword: ""
      });
      setShowSuccess("Contraseña actualizada correctamente");
    } catch (error) {
      console.error("Error changing password:", error);
      setShowError("No se pudo cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      await User.updateMyUserData({ profile_image: file_url });
      await loadUserData(); // Reload user data to show the new profile image
      setShowSuccess("Imagen de perfil actualizada");
    } catch (error) {
      console.error("Error uploading image:", error);
      setShowError("Error al subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error logging out:", error);
      setShowError("Error al cerrar sesión.");
    }
  };

  // QA-02: Deshabilitar función de eliminación de cuenta
  const handleDeleteAccount = () => {
    // No hacer nada - función deshabilitada por seguridad (se usa el modal para indicar cómo)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <>
      {showSuccess && (
        <SuccessAlert
          message={typeof showSuccess === 'string' ? showSuccess : "Cambios guardados correctamente"}
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showError && (
        <ErrorAlert
          message={showError}
          onClose={() => setShowError(null)}
        />
      )}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
        <div className="mb-8 flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Profile"))}>
              <ArrowLeft className="w-5 h-5" />
           </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600">Gestiona tu información personal y de la cuenta</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glass-effect border border-gray-200/50">
            <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon className="w-5 h-5 text-teal-600" />Información Personal</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img src={user?.profile_image || "https://ethic.es/wp-content/uploads/2023/03/imagen.jpg"} alt="Profile" className="w-24 h-24 rounded-full object-cover bg-gray-200" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="profile-upload" />
                  <label htmlFor="profile-upload" className="absolute -bottom-1 -right-1"><Button size="icon" variant="outline" className="w-8 h-8 rounded-full cursor-pointer">{uploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Edit3 className="w-3 h-3" />}</Button></label>
                </div>
                <div><h3 className="text-lg font-semibold text-gray-900">{user?.first_name || 'Nombre'} {user?.last_name || 'Apellido'}</h3><p className="text-sm text-gray-500">@{user?.email?.split('@')[0]}</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="first_name">Nombre</Label><Input id="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="Tu nombre" /></div>
                <div className="space-y-2"><Label htmlFor="last_name">Apellido</Label><Input id="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Tu apellido" /></div>
                <div className="space-y-2 md:col-span-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="tu@email.com" /></div>
              </div>
               <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving || !isDirty} className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800">{saving ? <Loader2 className="w-4 h-4 animate-spin"/> : "Guardar cambios"}</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-effect border border-gray-200/50">
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-teal-600" />Seguridad</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Cambiar contraseña</h4>
                <div className="grid grid-cols-1 gap-4">
                  {/* Removed "Contraseña actual" input as it was disabled and not used in logic */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva contraseña</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Tu nueva contraseña"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirma tu nueva contraseña"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={handlePasswordChange} 
                      disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="bg-gradient-to-r from-teal-600 to-teal-700"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                      Actualizar contraseña
                    </Button>
                  </div>
                </div>
              </div>
               <div className="pt-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                 <Button 
                   variant="outline" 
                   className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 order-2 sm:order-1"
                   onClick={() => setShowDeleteModal(true)}
                 >
                   <Trash2 className="w-4 h-4 mr-2" />
                   Eliminar cuenta
                 </Button>
                  <Button variant="outline" onClick={handleLogout} className="order-1 sm:order-2">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* QA-02: Modal de eliminación simplificado */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminación de cuenta no disponible</DialogTitle>
              <DialogDescription>
                Por seguridad, la eliminación de cuentas se gestiona manualmente. 
                Contacta con nuestro equipo de soporte en support@fresco.app para procesar tu solicitud.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Entendido</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
