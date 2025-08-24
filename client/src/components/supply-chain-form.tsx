import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { assessmentInputSchema, type AssessmentInput, type Supplier } from "@shared/schema";
import { Building, Users, Route, AlertTriangle, Plus, RotateCcw, Brain } from "lucide-react";

interface SupplyChainFormProps {
  onAssessmentCreated: (id: string) => void;
  isProcessing: boolean;
}

export default function SupplyChainForm({ onAssessmentCreated, isProcessing }: SupplyChainFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { name: "", location: "", criticality: "Medium", products: "" }
  ]);

  const form = useForm<AssessmentInput>({
    resolver: zodResolver(assessmentInputSchema.omit({ suppliers: true })), // Validate suppliers separately
    defaultValues: {
      companyName: "",
      industry: "",
      suppliers: suppliers,
      logisticsRoutes: "",
      transportationMethods: {
        ocean: false,
        air: false,
        truck: false,
        rail: false,
      },
      riskFactors: "",
    },
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: AssessmentInput) => {
      const response = await apiRequest("POST", "/api/assessments", data);
      return response.json();
    },
    onSuccess: (assessment) => {
      toast({
        title: "Assessment Created",
        description: "Your supply chain assessment has been submitted for AI analysis.",
      });
      onAssessmentCreated(assessment.id);
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Assessment Failed",
        description: error.message || "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AssessmentInput) => {
    // Validate suppliers manually since they're in separate state
    if (suppliers.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one supplier is required.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if all suppliers have required fields
    const incompleteSuppliers = suppliers.filter(s => !s.name || !s.location || !s.products);
    if (incompleteSuppliers.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all supplier information (name, location, and products).",
        variant: "destructive",
      });
      return;
    }
    
    const formData = { ...data, suppliers };
    console.log("Submitting assessment data:", formData);
    createAssessmentMutation.mutate(formData);
  };

  const addSupplier = () => {
    setSuppliers([...suppliers, { name: "", location: "", criticality: "Medium", products: "" }]);
  };

  const updateSupplier = (index: number, field: keyof Supplier, value: string) => {
    const updated = [...suppliers];
    updated[index] = { ...updated[index], [field]: value };
    setSuppliers(updated);
  };

  const removeSupplier = (index: number) => {
    if (suppliers.length > 1) {
      setSuppliers(suppliers.filter((_, i) => i !== index));
    }
  };

  const resetForm = () => {
    form.reset();
    setSuppliers([{ name: "", location: "", criticality: "Medium", products: "" }]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Supply Chain Assessment</CardTitle>
            <p className="text-gray-600 mt-1">Input your supply chain data for AI-powered vulnerability analysis</p>
          </div>
          <Button variant="ghost" size="sm" onClick={resetForm} data-testid="button-reset-form">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Building className="text-primary mr-2 h-5 w-5" />
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="TechCorp Industries" {...field} data-testid="input-company-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry Sector</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-industry">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Automotive">Automotive</SelectItem>
                          <SelectItem value="Energy">Energy</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Suppliers */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users className="text-primary mr-2 h-5 w-5" />
                Key Suppliers
              </h3>
              <div className="space-y-4">
                {suppliers.map((supplier, index) => (
                  <Card key={index} className="border-gray-200 bg-gray-50">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Supplier Name
                          </label>
                          <Input
                            placeholder="Global Components Ltd"
                            value={supplier.name}
                            onChange={(e) => updateSupplier(index, "name", e.target.value)}
                            data-testid={`input-supplier-name-${index}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <Select
                            value={supplier.location}
                            onValueChange={(value) => updateSupplier(index, "location", value)}
                          >
                            <SelectTrigger data-testid={`select-supplier-location-${index}`}>
                              <SelectValue placeholder="Select port location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Shanghai Port, China">Shanghai Port, China</SelectItem>
                              <SelectItem value="Los Angeles Port, USA">Los Angeles Port, USA</SelectItem>
                              <SelectItem value="New York Port, USA">New York Port, USA</SelectItem>
                              <SelectItem value="Rotterdam Port, Netherlands">Rotterdam Port, Netherlands</SelectItem>
                              <SelectItem value="Singapore Port, Singapore">Singapore Port, Singapore</SelectItem>
                              <SelectItem value="Dubai Port, UAE">Dubai Port, UAE</SelectItem>
                              <SelectItem value="Mumbai Port, India">Mumbai Port, India</SelectItem>
                              <SelectItem value="Santos Port, Brazil">Santos Port, Brazil</SelectItem>
                              <SelectItem value="London Gateway, UK">London Gateway, UK</SelectItem>
                              <SelectItem value="Cape Town Port, South Africa">Cape Town Port, South Africa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Criticality Level
                          </label>
                          <Select
                            value={supplier.criticality}
                            onValueChange={(value: "High" | "Medium" | "Low") => 
                              updateSupplier(index, "criticality", value)
                            }
                          >
                            <SelectTrigger data-testid={`select-supplier-criticality-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Products/Services
                        </label>
                        <Textarea
                          placeholder="Semiconductor components, microprocessors, memory modules"
                          rows={2}
                          value={supplier.products}
                          onChange={(e) => updateSupplier(index, "products", e.target.value)}
                          data-testid={`textarea-supplier-products-${index}`}
                        />
                      </div>
                      {suppliers.length > 1 && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSupplier(index)}
                            data-testid={`button-remove-supplier-${index}`}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={addSupplier}
                  data-testid="button-add-supplier"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Supplier
                </Button>
              </div>
            </div>

            {/* Logistics Routes */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Route className="text-primary mr-2 h-5 w-5" />
                Logistics Routes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="logisticsRoutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Shipping Routes</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger data-testid="select-logistics-routes">
                            <SelectValue placeholder="Select primary shipping route" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New York Port to Mumbai Port">New York Port to Mumbai Port</SelectItem>
                            <SelectItem value="Shanghai Port to Los Angeles Port">Shanghai Port to Los Angeles Port</SelectItem>
                            <SelectItem value="Rotterdam Port to New York Port">Rotterdam Port to New York Port</SelectItem>
                            <SelectItem value="Singapore Port to Dubai Port">Singapore Port to Dubai Port</SelectItem>
                            <SelectItem value="Los Angeles Port to Shanghai Port">Los Angeles Port to Shanghai Port</SelectItem>
                            <SelectItem value="Mumbai Port to London Gateway">Mumbai Port to London Gateway</SelectItem>
                            <SelectItem value="Santos Port to Rotterdam Port">Santos Port to Rotterdam Port</SelectItem>
                            <SelectItem value="Dubai Port to Singapore Port">Dubai Port to Singapore Port</SelectItem>
                            <SelectItem value="Cape Town Port to Santos Port">Cape Town Port to Santos Port</SelectItem>
                            <SelectItem value="London Gateway to Cape Town Port">London Gateway to Cape Town Port</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Transportation Methods</FormLabel>
                  <div className="space-y-2 mt-2">
                    <FormField
                      control={form.control}
                      name="transportationMethods.ocean"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-transport-ocean"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">Ocean Freight</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transportationMethods.air"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-transport-air"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">Air Freight</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transportationMethods.truck"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-transport-truck"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">Trucking</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transportationMethods.rail"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-transport-rail"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">Rail</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="text-primary mr-2 h-5 w-5" />
                Known Risk Factors
              </h3>
              <FormField
                control={form.control}
                name="riskFactors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select applicable risk factors (check all that apply)</FormLabel>
                    <FormControl>
                      <div className="space-y-3 mt-2">
                        {/* Predefined Risk Factors as Checkboxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <label className="flex items-center space-x-2">
                            <Checkbox 
                              checked={field.value?.includes('Geopolitical tensions in supplier regions')}
                              onCheckedChange={(checked) => {
                                const currentFactors = field.value?.split(', ') || [];
                                if (checked) {
                                  field.onChange([...currentFactors, 'Geopolitical tensions in supplier regions'].join(', '));
                                } else {
                                  field.onChange(currentFactors.filter(f => f !== 'Geopolitical tensions in supplier regions').join(', '));
                                }
                              }}
                              data-testid="checkbox-risk-geopolitical"
                            />
                            <span className="text-sm">Geopolitical tensions in supplier regions</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <Checkbox 
                              checked={field.value?.includes('Port congestion issues')}
                              onCheckedChange={(checked) => {
                                const currentFactors = field.value?.split(', ') || [];
                                if (checked) {
                                  field.onChange([...currentFactors, 'Port congestion issues'].join(', '));
                                } else {
                                  field.onChange(currentFactors.filter(f => f !== 'Port congestion issues').join(', '));
                                }
                              }}
                              data-testid="checkbox-risk-congestion"
                            />
                            <span className="text-sm">Port congestion issues</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <Checkbox 
                              checked={field.value?.includes('Currency fluctuations')}
                              onCheckedChange={(checked) => {
                                const currentFactors = field.value?.split(', ') || [];
                                if (checked) {
                                  field.onChange([...currentFactors, 'Currency fluctuations'].join(', '));
                                } else {
                                  field.onChange(currentFactors.filter(f => f !== 'Currency fluctuations').join(', '));
                                }
                              }}
                              data-testid="checkbox-risk-currency"
                            />
                            <span className="text-sm">Currency fluctuations</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <Checkbox 
                              checked={field.value?.includes('Regulatory changes')}
                              onCheckedChange={(checked) => {
                                const currentFactors = field.value?.split(', ') || [];
                                if (checked) {
                                  field.onChange([...currentFactors, 'Regulatory changes'].join(', '));
                                } else {
                                  field.onChange(currentFactors.filter(f => f !== 'Regulatory changes').join(', '));
                                }
                              }}
                              data-testid="checkbox-risk-regulatory"
                            />
                            <span className="text-sm">Regulatory changes</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <Checkbox 
                              checked={field.value?.includes('Pirates or terrorist threats')}
                              onCheckedChange={(checked) => {
                                const currentFactors = field.value?.split(', ') || [];
                                if (checked) {
                                  field.onChange([...currentFactors, 'Pirates or terrorist threats'].join(', '));
                                } else {
                                  field.onChange(currentFactors.filter(f => f !== 'Pirates or terrorist threats').join(', '));
                                }
                              }}
                              data-testid="checkbox-risk-security"
                            />
                            <span className="text-sm">Pirates or terrorist threats</span>
                          </label>
                        </div>
                        
                        {/* Other Risk Factors Text Area */}
                        <div className="mt-4">
                          <label className="flex items-center space-x-2 mb-2">
                            <Checkbox data-testid="checkbox-risk-other" />
                            <span className="text-sm font-medium">Other risk factors (specify below)</span>
                          </label>
                          <Textarea
                            placeholder="Describe any additional risk factors not listed above..."
                            rows={3}
                            onChange={(e) => {
                              const otherRisks = e.target.value;
                              const predefinedRisks = ['Geopolitical tensions in supplier regions', 'Port congestion issues', 'Currency fluctuations', 'Regulatory changes', 'Pirates or terrorist threats']
                                .filter(risk => field.value?.includes(risk));
                              if (otherRisks.trim()) {
                                field.onChange([...predefinedRisks, otherRisks].join(', '));
                              } else {
                                field.onChange(predefinedRisks.join(', '));
                              }
                            }}
                            data-testid="textarea-risk-other"
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500 flex items-center">
                <Brain className="mr-1 h-4 w-4" />
                Data is processed securely using Gemini 2.5 Flash AI
              </div>
              <Button
                type="submit"
                disabled={createAssessmentMutation.isPending || isProcessing}
                data-testid="button-analyze-vulnerabilities"
              >
                {createAssessmentMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Creating Assessment...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analyze Vulnerabilities
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
