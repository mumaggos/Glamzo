const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldStr = `          glamzo_points: currentPoints + pointsAllocVal
        })
        });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to update');
      setSuccessMsg(\`Crédito de fomento atribuído com sucesso! Alocados +\${pointsAllocVal} pontos promocionais à conta do utilizador.\`);
      // Update local state
      setProfiles(prev => prev.map(p => p.id === pointsAllocUserId ? { ...p, glamzo_points: currentPoints + pointsAllocVal } : p));
        })
    } catch (err: any) {`;

const newStr = `          glamzo_points: currentPoints + pointsAllocVal
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to update');
      setSuccessMsg(\`Crédito de fomento atribuído com sucesso! Alocados +\${pointsAllocVal} pontos promocionais à conta do utilizador.\`);
      // Update local state
      setProfiles(prev => prev.map(p => p.id === pointsAllocUserId ? { ...p, glamzo_points: currentPoints + pointsAllocVal } : p));
    } catch (err: any) {`;

content = content.replace(oldStr, newStr);
fs.writeFileSync('src/pages/Admin.tsx', content);
console.log('Fixed fetch');
