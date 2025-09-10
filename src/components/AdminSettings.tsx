import React, { useState } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    // System Settings
    systemName: 'Exception Hub',
    systemVersion: '1.0.0',
    maintenanceMode: false,
    maxFileSize: '10',
    sessionTimeout: '30',
    
    // API Settings
    apiBaseUrl: 'http://sqppavdi049806:8089',
    apiTimeout: '30',
    retryAttempts: '3',
    
    // Email Settings
    smtpServer: 'smtp.company.com',
    smtpPort: '587',
    emailFrom: 'noreply@company.com',
    emailEnabled: true,
    
    // Security Settings
    passwordMinLength: '8',
    passwordComplexity: true,
    twoFactorAuth: false,
    sessionSecurity: 'standard',
    
    // Notification Settings
    emailNotifications: true,
    systemAlerts: true,
    auditLogging: true,
    logLevel: 'info'
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // In a real application, this would save to an API
    toast({
      title: 'Settings Saved',
      description: 'System settings have been updated successfully.',
    });
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      systemName: 'Exception Hub',
      systemVersion: '1.0.0',
      maintenanceMode: false,
      maxFileSize: '10',
      sessionTimeout: '30',
      apiBaseUrl: 'http://sqppavdi049806:8089',
      apiTimeout: '30',
      retryAttempts: '3',
      smtpServer: 'smtp.company.com',
      smtpPort: '587',
      emailFrom: 'noreply@company.com',
      emailEnabled: true,
      passwordMinLength: '8',
      passwordComplexity: true,
      twoFactorAuth: false,
      sessionSecurity: 'standard',
      emailNotifications: true,
      systemAlerts: true,
      auditLogging: true,
      logLevel: 'info'
    });
    
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to default values.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Configuration
            </CardTitle>
            <CardDescription>
              Basic system settings and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={settings.systemName}
                  onChange={(e) => handleInputChange('systemName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemVersion">System Version</Label>
                <Input
                  id="systemVersion"
                  value={settings.systemVersion}
                  onChange={(e) => handleInputChange('systemVersion', e.target.value)}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
              />
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Configure API endpoints and connection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="apiBaseUrl">API Base URL</Label>
                <Input
                  id="apiBaseUrl"
                  value={settings.apiBaseUrl}
                  onChange={(e) => handleInputChange('apiBaseUrl', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiTimeout">API Timeout (seconds)</Label>
                <Input
                  id="apiTimeout"
                  type="number"
                  value={settings.apiTimeout}
                  onChange={(e) => handleInputChange('apiTimeout', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retryAttempts">Retry Attempts</Label>
                <Input
                  id="retryAttempts"
                  type="number"
                  value={settings.retryAttempts}
                  onChange={(e) => handleInputChange('retryAttempts', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
            <CardDescription>
              Configure email server and notification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="emailEnabled"
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => handleInputChange('emailEnabled', checked)}
              />
              <Label htmlFor="emailEnabled">Enable Email Notifications</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpServer">SMTP Server</Label>
                <Input
                  id="smtpServer"
                  value={settings.smtpServer}
                  onChange={(e) => handleInputChange('smtpServer', e.target.value)}
                  disabled={!settings.emailEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                  disabled={!settings.emailEnabled}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emailFrom">From Email Address</Label>
                <Input
                  id="emailFrom"
                  type="email"
                  value={settings.emailFrom}
                  onChange={(e) => handleInputChange('emailFrom', e.target.value)}
                  disabled={!settings.emailEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Configure security and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleInputChange('passwordMinLength', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionSecurity">Session Security Level</Label>
                <Select
                  value={settings.sessionSecurity}
                  onValueChange={(value) => handleInputChange('sessionSecurity', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="passwordComplexity"
                  checked={settings.passwordComplexity}
                  onCheckedChange={(checked) => handleInputChange('passwordComplexity', checked)}
                />
                <Label htmlFor="passwordComplexity">Require Password Complexity</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleInputChange('twoFactorAuth', checked)}
                />
                <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification & Logging */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications & Logging</CardTitle>
            <CardDescription>
              Configure system notifications and logging preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                />
                <Label htmlFor="emailNotifications">Email Notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="systemAlerts"
                  checked={settings.systemAlerts}
                  onCheckedChange={(checked) => handleInputChange('systemAlerts', checked)}
                />
                <Label htmlFor="systemAlerts">System Alerts</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="auditLogging"
                  checked={settings.auditLogging}
                  onCheckedChange={(checked) => handleInputChange('auditLogging', checked)}
                />
                <Label htmlFor="auditLogging">Audit Logging</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logLevel">Log Level</Label>
              <Select
                value={settings.logLevel}
                onValueChange={(value) => handleInputChange('logLevel', value)}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};