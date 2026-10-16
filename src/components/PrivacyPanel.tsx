import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { localStorageService, getAllPrefs, STORAGE_KEYS } from "@/lib/localStorage";

export function LocalStoragePanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Array<{ key: string; value: string }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      return localStorageService.getAllStoredItems();
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      setError(null);
      setItems(localStorageService.getAllStoredItems());
    } catch {
      setError("Failed to read local storage.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onPrefChange = () => refresh();
    if (typeof window === "undefined") return;
    window.addEventListener("convaudit:pref-change", onPrefChange);
    return () => window.removeEventListener("convaudit:pref-change", onPrefChange);
  }, [refresh]);

  const handleReset = async () => {
    setClearing(true);
    setError(null);
    try {
      localStorageService.resetAllPrefs();
      await refresh();
    } catch {
      setError("Failed to reset local storage.");
    } finally {
      setClearing(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    setError(null);
    try {
      localStorageService.clearAllPrefs();
      await refresh();
    } catch {
      setError("Failed to clear data.");
    } finally {
      setClearing(false);
    }
  };

  const prefs = getAllPrefs();
  const recentTools = (() => {
    try {
      const raw = items.find((item) => item.key === STORAGE_KEYS.recentTools)?.value ?? "[]";
      return JSON.parse(raw) as string[];
    } catch {
      return [] as string[];
    }
  })();

  const stats = {
    count: items.length,
    tracking: Boolean(prefs[STORAGE_KEYS.privacyTrackingEnabled]),
    ack: Boolean(prefs[STORAGE_KEYS.privacyAcknowledged]),
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground hover:text-foreground"
        aria-label="View your local privacy data"
      >
        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
        Privacy
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Privacy Dashboard
              <Badge variant="secondary" className="ml-auto text-xs">Client-side only</Badge>
            </DialogTitle>
            <DialogDescription>
              Convaudit runs 100% in your browser. Files never leave your device.
              This panel shows what preferences are stored locally.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="flex items-center justify-center py-3">
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{stats.count}</p>
                    <p className="text-xs text-muted-foreground">Items</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-center py-3">
                  <div className="text-center">
                    <p className={`text-2xl font-semibold ${stats.tracking ? "text-amber-600" : "text-emerald-600"}`}>
                      {stats.tracking ? "On" : "Off"}
                    </p>
                    <p className="text-xs text-muted-foreground">Tracking</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-center py-3">
                  <div className="text-center">
                    <p className={`text-2xl font-semibold ${stats.ack ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {stats.ack ? "Yes" : "No"}
                    </p>
                    <p className="text-xs text-muted-foreground">Acknowledged</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent tools visited</CardTitle>
                <CardDescription>Saved in the browser to remember where you were</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {recentTools.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No recent tools yet.</p>
                  ) : (
                    recentTools.slice(0, 5).map((slug: string) => (
                      <Badge key={slug} variant="outline" className="capitalize text-xs">
                        {slug.replace("youtube-", "YouTube ")}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">All stored keys</CardTitle>
                <CardDescription>Keys in your browser&apos;s local storage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 max-h-64 overflow-y-auto">
                {loading ? (
                  <p className="text-xs text-muted-foreground">Loading...</p>
                ) : error ? (
                  <p className="text-xs text-destructive">{error}</p>
                ) : items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No stored data found.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                      <span className="text-xs font-mono text-foreground truncate">{item.key}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={clearing} className="flex-1">
                <RefreshCw className={`mr-2 h-4 w-4 ${clearing ? "animate-spin" : ""}`} />
                Reset
              </Button>
              <Button variant="destructive" onClick={handleClear} disabled={clearing} className="flex-1">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear all
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
