import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Company {
  id: string;
  name: string;
  color: string;
}

interface TournamentSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: Company[];
  isLoadingCompanies: boolean;
  selectedCompanyA: string;
  selectedCompanyB: string;
  onCompanyAChange: (value: string) => void;
  onCompanyBChange: (value: string) => void;
  onCreateTournament: () => void;
}

export default function TournamentSetup({
  open,
  onOpenChange,
  companies,
  isLoadingCompanies,
  selectedCompanyA,
  selectedCompanyB,
  onCompanyAChange,
  onCompanyBChange,
  onCreateTournament,
}: TournamentSetupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Настройка турнира</DialogTitle>
          <DialogDescription>
            Выберите две компании для проведения турнира продаж
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Компания A</Label>
            <Select value={selectedCompanyA} onValueChange={onCompanyAChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите компанию" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCompanies ? (
                  <SelectItem value="loading" disabled>
                    Загрузка...
                  </SelectItem>
                ) : (
                  companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Компания B</Label>
            <Select value={selectedCompanyB} onValueChange={onCompanyBChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите компанию" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCompanies ? (
                  <SelectItem value="loading" disabled>
                    Загрузка...
                  </SelectItem>
                ) : (
                  companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Призовой фонд:</span>
              <span className="font-semibold">20 000₽</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Формат:</span>
              <span>1v1 Tournament</span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={onCreateTournament}
            disabled={!selectedCompanyA || !selectedCompanyB}
          >
            Создать турнир
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
